import { Field, ID, ObjectType } from 'type-graphql';
import { User } from '../generated/type-graphql/models';

@ObjectType()
export class CleanUser {
  @Field(() => ID)
  id: string;
  @Field()  
  email: string;
  @Field()
  tenantId: string;
  @Field(() => String, { nullable: true })
  name?: string | null;
}

export function cleanUser(user: User): CleanUser {
  return {
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    name: user.name,
  };
}
