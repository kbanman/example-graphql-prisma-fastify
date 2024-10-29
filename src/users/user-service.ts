import { PrismaClient } from '@/generated/prisma';
import { TenantId } from '@/tenants/tenant-service';
import { CreateUserInput } from './UserResolver';
import { User } from '@/generated/type-graphql/models';
import { createId, parseId } from '@/util/create-id';
import * as bcryptUtil from '@/auth/util/bcrypt';
import { NotFoundError } from '@/errors/not-found-error';
import { PrismaTrx } from '@/util/transaction';
import { inject, singleton } from 'tsyringe';
import { BadInputError } from '@/errors/bad-input-error';

export const PREFIX = 'usr';
export type UserId = `${typeof PREFIX}-${string}`;
export const parseUserId = parseId(PREFIX);

@singleton()
export class UserService {
  constructor(@inject('prisma') private prisma: PrismaClient) { }

  async create(tenantId: TenantId, input: CreateUserInput, db: PrismaTrx = this.prisma): Promise<User> {
    // Make sure the user does not already exist
    const existingUser = await db.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new BadInputError(`User with email ${input.email} already exists`);
    }
    
    return db.user.create({
      data: {
        id: createId(PREFIX),
        tenantId,
        email: input.email,
        name: input.name,
        password: {
          create: {
            hash: await bcryptUtil.generateHash(input.password),
          },
        }
      },
    });
  }

  async findByIdOrThrow(userId: UserId): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError(`User (${userId}) not found.`);
    }

    return user;
  }

  async list(tenantId: TenantId, options: ListUsersArgs = {}): Promise<User[]> {
    const { offset = 0, limit = 20 } = options;
    return this.prisma.user.findMany({
      where: { tenantId },
      skip: offset,
      take: limit,
    });
  }
}

interface ListUsersArgs {
  offset?: number;
  limit?: number;
}
