import type { FastifyReply, FastifyRequest } from 'fastify';
import Session from 'supertokens-node/recipe/session';
import { UserId } from '../../users/user-service';
import { TenantId } from '../../tenants/tenant-service';

type MaybeSession = {
  userId?: UserId
  tenantId?: TenantId
}

export async function getSession(request: FastifyRequest, reply: FastifyReply): Promise<MaybeSession> {
  try {
    const session = await Session.getSession(request, reply, { antiCsrfCheck: false, sessionRequired: false, checkDatabase: false });
    let userId: string | null = null;
    let tenantId: string | null = null;
    if (session) {
      userId = session.getUserId();
      const claims: { name: string; tenantName: string; tenantId: string } = session.getAccessTokenPayload();
      tenantId = claims.tenantId;
      return {
        userId: userId as UserId,
        tenantId: tenantId as TenantId,
      }
    }
  } catch (err) {
    console.error('getSession error', (err as Error).message);
    return {};
  }

  return {};
}