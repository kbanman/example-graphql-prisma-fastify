import { PrismaClient } from '@/generated/prisma';
import { ITXClientDenyList } from '@prisma/client/runtime/library';

export type PrismaTrx = Omit<PrismaClient, ITXClientDenyList>;
