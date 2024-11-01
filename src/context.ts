import { BaseContext } from '@apollo/server'
import { ApolloFastifyContextFunction } from '@as-integrations/fastify'
import { FastifyReply, FastifyRequest } from 'fastify'
import {container} from "tsyringe";
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/auth/util/get-session'
import { UserId } from '@/users/user-service'
import { TenantId } from '@/tenants/tenant-service'

const prisma = new PrismaClient()

container.registerInstance("prisma", prisma);

export interface Context extends BaseContext {
  prisma: PrismaClient
  tenantId?: TenantId
  userId?: UserId
  request: FastifyRequest
  reply: FastifyReply
}

export interface AuthenticatedContext extends Context {
  tenantId: TenantId
  userId: UserId
}

export const createContext: ApolloFastifyContextFunction<Context> = async (request, reply) => {
  const session = await getSession(request, reply);

  return {
    prisma,
    request,
    reply,
    userId: session.userId as UserId,
    tenantId: session.tenantId as TenantId,
  }
};
