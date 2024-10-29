import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  Int,
  InputType,
  Field,
} from 'type-graphql'
import { Context } from '../context'
import { Post, User } from '../generated/type-graphql/models'
import { injectable } from 'tsyringe'

@InputType()
export class CreatePostInput {
  @Field()
  title: string

  @Field({ nullable: true })
  content: string
}

@InputType()
class OrderPostsByUpdatedAtInput {
  @Field(() => SortOrder)
  updatedAt: SortOrder
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@injectable()
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => User)
  author(@Root() post: Post, @Ctx() ctx: Context): Promise<User | null> {
    return ctx.prisma.post
      .findUnique({
        where: {
          id: post.id,
        },
      })
      .author()
  }

  @Query(() => Post, { nullable: true })
  async postById(@Arg('id') id: number, @Ctx() ctx: Context) {
    return ctx.prisma.post.findUnique({
      where: { id },
    })
  }

  @Query(() => [Post])
  async feed(
    @Arg('searchString', { nullable: true }) searchString: string,
    @Arg('skip', () => Int, { nullable: true }) skip: number,
    @Arg('take', () => Int, { nullable: true }) take: number,
    @Arg('orderBy', { nullable: true }) orderBy: OrderPostsByUpdatedAtInput,
    @Ctx() ctx: Context,
  ) {
    const or = searchString
      ? {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        }
      : {}

    return ctx.prisma.post.findMany({
      where: {
        published: true,
        ...or,
      },
      take: take || undefined,
      skip: skip || undefined,
      orderBy: orderBy || undefined,
    })
  }

  @Mutation(() => Post)
  async createDraft(
    @Arg('data') data: CreatePostInput,
    @Arg('authorEmail') authorEmail: string,

    @Ctx() ctx: Context,
  ) {
    return ctx.prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        author: {
          connect: { email: authorEmail },
        },
      },
    })
  }

  @Mutation(() => Post, { nullable: true })
  async togglePublishPost(
    @Arg('id', () => Int) id: number,
    @Ctx() ctx: Context,
  ) {
    const post = await ctx.prisma.post.findUnique({
      where: { id: id || undefined },
      select: {
        published: true,
      },
    })

    return ctx.prisma.post.update({
      where: { id: id || undefined },
      data: { published: !post?.published },
    })
  }

  @Mutation(() => Post, { nullable: true })
  async incrementPostViewCount(
    @Arg('id', () => Int) id: number,
    @Ctx() ctx: Context,
  ) {
    return ctx.prisma.post.update({
      where: { id: id || undefined },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })
  }

  @Mutation(() => Post, { nullable: true })
  async deletePost(@Arg('id', () => Int) id: number, @Ctx() ctx: Context) {
    return ctx.prisma.post.delete({
      where: {
        id,
      },
    })
  }
}