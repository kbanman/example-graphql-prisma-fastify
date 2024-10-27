import { BaseContext } from '@apollo/server'
import { ApolloFastifyContextFunction } from '@as-integrations/fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Context extends BaseContext {
  prisma: PrismaClient
}

export const createContext: ApolloFastifyContextFunction<Context> = async (request, reply) => ({
  prisma,
});
