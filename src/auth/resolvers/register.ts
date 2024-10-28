import { InputType, Field, Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import { ObjectType } from 'type-graphql';
import { Tenant, User } from '../../generated/type-graphql/models/index.js';
import { TenantService } from '../../tenants/tenant-service.js';

@InputType()
export class RegisterInput {
  @Field()
  companyName: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
class RegisterResult {
  @Field(() => User)
  user: User;

  @Field(() => Tenant)
  tenant: Tenant;
}

@Resolver()
export class RegisterResolver {
  constructor(private tenantService: TenantService) {}

  @Mutation(() => RegisterResult)
  async register(@Arg('input') input: RegisterInput) {
    return this.tenantService.registerTenant(input);
  }
}
