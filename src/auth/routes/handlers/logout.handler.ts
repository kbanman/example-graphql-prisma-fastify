/**
 * There are multiple ways to revoke sessions with SuperTokens. Read more from the link below:
 * https://supertokens.io/docs/session/common-customizations/sessions/revoke-session
 */

import { RouteHandler } from 'fastify';
import { SessionRequest } from 'supertokens-node/framework/fastify';

type ResponseBody = {
  message: string;
};
export const logoutHandler: RouteHandler = async (req: SessionRequest, reply) => {
  await req.session?.revokeSession();

  reply.send({
    message: 'OK',
  } as ResponseBody);
};
