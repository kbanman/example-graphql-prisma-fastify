import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from 'type-graphql';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import { InternalServerError, UnauthenticatedError } from '@/errors';
import * as bcryptUtil from '../util/bcrypt';
import { CleanUser, cleanUser } from '../clean-user';
import { Tenant } from '@/generated/type-graphql/models';
import { Context } from '@/context';
import { AccessTokenPayload } from '../access-token';
import { singleton } from 'tsyringe';

@InputType()
export class LoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

@ObjectType()
export class LoginResult {
  @Field()
  user: CleanUser;
  @Field()
  tenant: Tenant;
};

@singleton()
@Resolver()
export class LoginResolver {
  @Mutation(() => LoginResult)
  async login(
    @Ctx() ctx: Context,
    @Arg('input') input: LoginInput,
  ): Promise<LoginResult> {
    const { email, password } = input;

    const userRecord = await ctx.prisma.user.findUnique({ where: { email } });

    if (userRecord) {
      // Currently password is the only auth method, so we can assume there is a password record
      const passwordRecord = await ctx.prisma.password.findFirstOrThrow({ where: { userId: userRecord.id } });
      const isValidPassword = await bcryptUtil.verify(password, passwordRecord.hash);

      if (isValidPassword) {
        const user = cleanUser(userRecord);
        if (!ctx.request || !ctx.reply) {
          throw new InternalServerError('[auth.login] `request` or `reply` object does not exist');
        }
        if (!user.tenantId || !user.id) {
          throw new InternalServerError('[auth.login] `user.tenantId` or `user.id` does not exist');
        }

        const tenant = await ctx.prisma.tenant.findUniqueOrThrow({ where: { id: user.tenantId } });

        const sessionPayload = {
          name: user.name,
          tenantName: tenant.name,
          tenantId: user.tenantId,
        };

        const session = await Session.createNewSession(ctx.request, ctx.reply, 'public', supertokens.convertToRecipeUserId(user.id), sessionPayload);

        const accessTokenPayload: AccessTokenPayload = {
          userId: user.id,
          tenantId: user.tenantId,
        };

        try {
          await session.mergeIntoAccessTokenPayload(accessTokenPayload);
        } catch (err) {
          console.error('[auth.login] Error merging session into access token payload', accessTokenPayload);
          throw err;
        }

        return {
          user,
          tenant,
        };
      }
    }

    console.error('[auth.login] No user');
    throw new UnauthenticatedError('Invalid username/email or password');
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: Context): Promise<boolean> {
    if (!ctx.request || !ctx.reply) {
      throw new InternalServerError('[auth.logout] `request` or `reply` object does not exist');
    }
    
    const session = await Session.getSession(ctx.request, ctx.reply);
    await session.revokeSession();

    return true;
  }
}
