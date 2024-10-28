import { Context } from '../../context';
import { UnauthenticatedError } from '../../errors/unauthenticated-error';

export interface AuthenticatedContext {
  userId: string;
  tenantId: string;
}

export const checkAuthentication = async (ctx: Context): Promise<AuthenticatedContext> => {
  if (!ctx.userId || !ctx.tenantId) {
    throw new UnauthenticatedError();
  }

  return {
    userId: ctx.userId,
    tenantId: ctx.tenantId,
  };
};
