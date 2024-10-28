import { AuthenticatedContext, Context } from '../context';
import { UnauthenticatedError } from '../errors/unauthenticated-error';

export const requireAuth = (ctx: Context): AuthenticatedContext => {
  // If needed, you can also check whether the user still exists in the database here
  if (!ctx.userId || !ctx.tenantId) {
    throw new UnauthenticatedError();
  }

  return ctx as AuthenticatedContext;
};
