import 'reflect-metadata'
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  InputType,
  Field,
} from 'type-graphql'
import { Context } from '../context'
import { Post, User } from '../generated/type-graphql/models'
import { UserService } from './user-service'
import { requireAuth } from '../util/require-auth'

@InputType()
class UserUniqueInput {
  @Field({ nullable: true })
  id: string

  @Field({ nullable: true })
  email: string
}

@InputType()
export class CreateUserInput {
  @Field()
  email: string

  @Field({ nullable: true })
  name: string

  @Field()
  password: string
}

@Resolver(User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @FieldResolver(() => [Post])
  async posts(@Root() user: User, @Ctx() ctx: Context): Promise<Post[]> {
    return await ctx.prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .posts() ?? []
  }

  @Mutation(() => User)
  async signupUser(
    @Arg('data') data: CreateUserInput,
    @Ctx() ctx: Context,
  ): Promise<User> {
    const { tenantId } = requireAuth(ctx);
    return this.userService.create(tenantId, data)
  }

  @Query(() => [User])
  async allUsers(@Ctx() ctx: Context) {
    return ctx.prisma.user.findMany()
  }

  @Query(() => [Post], { nullable: true })
  async draftsByUser(
    @Arg('userUniqueInput') userUniqueInput: UserUniqueInput,
    @Ctx() ctx: Context,
  ) {
    return ctx.prisma.user
      .findUnique({
        where: {
          id: userUniqueInput.id || undefined,
          email: userUniqueInput.email || undefined,
        },
      })
      .posts({
        where: {
          published: false,
        },
      })
  }
}