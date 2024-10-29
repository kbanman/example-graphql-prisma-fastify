import {
  Resolver,
  Query,
  Arg,
  Ctx,
  ObjectType,
  Field,
  InputType,
} from 'type-graphql'
import { Context } from '@/context'
import { Tenant, User } from '@/generated/type-graphql/models';


@InputType()
export class CreateTenantInput {
  @Field()
  name: string
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
}
