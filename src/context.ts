import { BaseContext } from '@apollo/server'
import { ApolloFastifyContextFunction } from '@as-integrations/fastify'
import { PrismaClient } from '@prisma/client'
import { getSession } from './auth/util/get-session'
import { UserId } from './users/user-service'
import { TenantId } from './tenants/tenant-service'

const prisma = new PrismaClient()

export interface Context extends BaseContext {
  prisma: PrismaClient
  tenantId?: TenantId
  userId?: UserId
}

export interface AuthenticatedContext extends Context {
  tenantId: TenantId
  userId: UserId
}

export const createContext: ApolloFastifyContextFunction<Context> = async (request, reply) => {
  const session = await getSession(request, reply);

  return {
    ...emptyContext,
    userId: session.userId as UserId,
    tenantId: session.tenantId as TenantId,
  }
};

export const emptyContext: Context = {
  prisma,
};
