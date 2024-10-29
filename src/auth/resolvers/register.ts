import { InputType, Field, Resolver, Mutation, Arg } from 'type-graphql';
import { ObjectType } from 'type-graphql';
import { Tenant, User } from '../../generated/type-graphql/models';
import { TenantService } from '../../tenants/tenant-service';
import { injectable } from 'tsyringe';

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

@injectable()
@Resolver()
export class RegisterResolver {
  constructor(private tenantService: TenantService) {}

  @Mutation(() => RegisterResult)
  async register(@Arg('input') input: RegisterInput) {
    return this.tenantService.registerTenant(input);
  }
}
