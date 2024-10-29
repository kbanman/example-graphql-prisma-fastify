import Session from 'supertokens-node/recipe/session';
import { UnauthenticatedError, UnauthorizedError } from '@/errors';
import { parseUserId, UserService } from '@/users/user-service';
import { container } from 'tsyringe';

export const SessionRecipe = Session.init({
  errorHandlers: {
    onTokenTheftDetected: (sessionHandle, userId, req, res) => {
      throw new UnauthorizedError('Token theft detected.', {
        sessionHandle,
        userId,
      });
    },
    onUnauthorised: (_, req, res) => {
      throw new UnauthenticatedError();
    },
  },
  // https://supertokens.io/docs/session/advanced-customizations/apis-override/usage
  override: {
    apis: (originalImplementation) => ({
      ...originalImplementation,
      // https://supertokens.io/docs/session/advanced-customizations/apis-override/disabling
      // signOutPOST: undefined,
    }),
    functions: (originalImplementation) => {
      const userService = container.resolve(UserService);
      return {
        ...originalImplementation,
        createNewSession: async (input) => {
          const { userId } = input;
          const user = await userService.findByIdOrThrow(parseUserId(userId));

          // This goes in the access token, and is available to read on the frontend.
          input.accessTokenPayload = {
            ...input.accessTokenPayload,
            userId: user.id,
            tenantId: user.tenantId,
            name: user.name,
            email: user.email,
          };

          return originalImplementation.createNewSession(input);
        },
      };
    },
  },
});
