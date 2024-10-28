import 'reflect-metadata'
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  InputType,
  Field,
  ObjectType,
} from 'type-graphql'
import { Context } from '../context'
import { createId } from '../util/create-id'
import { Tenant, User } from '../generated/type-graphql/models';

const TENANT_ID_PREFIX = 'tnt';
export type TenantId = `${typeof TENANT_ID_PREFIX}-${string}`;

@InputType()
export class CreateTenantInput {
  @Field()
  name: string

  @Field()
  ownerEmail: string

  @Field({ nullable: true })
  ownerName?: string
}

@ObjectType()
export class CreateTenantResult {
  @Field(() => Tenant)
  tenant: Tenant

  @Field(() => User)
  owner: User
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@Resolver(Tenant)
export class TenantResolver {
  @Query(() => Tenant, { nullable: true })
  async tenantById(@Ctx() ctx: Context, @Arg('id') id: string) {
    return ctx.prisma.tenant.findUnique({
      where: { id },
    })
  }

  @Mutation(() => Tenant)
  async createTenant(
    @Ctx() ctx: Context,
    @Arg('input') input: CreateTenantInput,
  ): Promise<CreateTenantResult> {
    const [owner, tenant] = await ctx.prisma.$transaction([
      ctx.prisma.user.create({
        data: {
          email: input.ownerEmail,
          name: input.ownerName,
        },
      }),
      ctx.prisma.tenant.create({
        data: {
          id: createId(TENANT_ID_PREFIX),
          name: input.name,
        }
      })
    ]);

    return { owner, tenant }
  }
}
