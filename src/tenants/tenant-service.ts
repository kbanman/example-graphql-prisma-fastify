import { PrismaClient } from '../generated/prisma';
import { CreateTenantInput } from './TenantResolver';
import { Tenant, User } from '../generated/type-graphql/models';
import { createId } from '../util/create-id';
import { NotFoundError } from '../errors';
import { RegisterInput } from '../auth/resolvers/register';
import { UserService } from '../users/user-service';
import { PrismaTrx } from '../util/transaction';
import { inject, singleton } from 'tsyringe';

const TENANT_ID_PREFIX = 'tnt';
export type TenantId = `${typeof TENANT_ID_PREFIX}-${string}`;

@singleton()
export class TenantService {
  constructor(
    @inject('prisma') private prisma: PrismaClient,
    private userService: UserService,
  ) { }

  async registerTenant(input: RegisterInput): Promise<{ tenant: Tenant, user: User }> {
    return this.prisma.$transaction(async (trx) => {
      const tenant = await this.create({ name: input.companyName }, trx);
      const user = await this.userService.create(tenant.id as TenantId, {
        name: input.name,
        email: input.email,
        password: input.password,
      }, trx);
      return { tenant, user };
    });
  }

  async create({ name }: CreateTenantInput, db: PrismaTrx = this.prisma): Promise<Tenant> {
    return db.tenant.create({
      data: {
        id: createId(TENANT_ID_PREFIX),
        name,
        updatedAt: new Date(),
      }
    });
  }

  async findByIdOrThrow(tenantId: TenantId): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant) {
      throw new NotFoundError(`Tenant (${tenantId}) not found.`);
    }

    return tenant;
  }

  async list(options: { offset?: number; limit?: number } = {}): Promise<Tenant[]> {
    const { limit, offset } = { offset: 0, limit: 10, ...options };

    return this.prisma.tenant.findMany({ skip: offset, take: limit });
  }
}