import { Field, InputType, ObjectType } from 'type-graphql';
import { FastifyRequest, FastifyReply } from 'fastify';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import { InternalServerError, UnauthenticatedError } from '../../errors';
import * as bcryptUtil from '../util/bcrypt';
import { CleanUser, cleanUser } from '../util/clean-user.js';
import { Tenant } from '../../generated/type-graphql/models';
import { Context } from '../../context';
import { AccessTokenPayload } from '../access-token';

@InputType()
export class LoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

@ObjectType()
export class LoginResult {
  user: CleanUser;
  tenant: Tenant;
};

export async function loginUseCase(ctx: Context, input: LoginInput, req: FastifyRequest, reply: FastifyReply): Promise<LoginResult> {
  const { email, password } = input;

  const userRecord = await ctx.prisma.user.findUnique({ where: { email } });

  if (userRecord) {
    // Currently password is the only auth method, so we can assume there is a password record
    const passwordRecord = await ctx.prisma.password.findFirstOrThrow({ where: { userId: userRecord.id } });
    const isValidPassword = await bcryptUtil.verify(password, passwordRecord.hash);

    if (isValidPassword) {
      const user = cleanUser(userRecord);
      if (!req || !reply) {
        throw new InternalServerError('[auth.login] `req` or `res` object does not exist');
      }
      if (!user.tenantId || !user.id) {
        throw new InternalServerError('[auth.login] `user.tenantId` or `user.id` does not exist');
      }

      const tenant = await ctx.prisma.tenant.findUniqueOrThrow({ where: { id: user.tenantId }});

      const sessionPayload = {
        name: user.name,
        tenantName: tenant.name,
        tenantId: user.tenantId,
      };

      const session = await Session.createNewSession(req, reply, 'public', supertokens.convertToRecipeUserId(`${user.id}`), sessionPayload);

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
