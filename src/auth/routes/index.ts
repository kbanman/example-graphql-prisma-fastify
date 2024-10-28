import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { verifySession } from 'supertokens-node/recipe/session/framework/fastify';
import { loginUseCase } from '../resolvers/login.js';
import { loginHandler } from './handlers/login.handler.js';
import { logoutHandler } from './handlers/logout.handler.js';
import { registerHandler } from './handlers/register.handler.js';
import { FastifyReply } from 'fastify/types/reply.js';
import { createContext, emptyContext } from '../../context.js';

export const authRouter: FastifyPluginCallback = (server, _opts, done) => {
  server.post('/auth/login', { preHandler: verifySession({ sessionRequired: false }) }, loginHandler);
  server.post('/auth/signout', { preHandler: verifySession() }, logoutHandler);
  server.post('/auth/register', { preHandler: verifySession({ sessionRequired: false }) }, registerHandler);

  if (process.env.NODE_ENV === 'development') {
    server.get('/auth/login/superadmin', async (req: FastifyRequest, reply: FastifyReply) => {
      // As of v13, this needs to be set. The Frontend SDK will automatically set this by default.
      // Since this is a workaround and is meant for local development, we'll have to set this here.
      req.headers['st-auth-mode'] = 'cookie';

      const ctx = await createContext(req, reply);
      if (!ctx) throw new Error('No identity found in request context');

      // @todo
      console.log('authRouter is running');

      await loginUseCase(
        ctx,
        {
          email: 'superadmin@app.com',
          password: 'password',
        },
        req,
        reply,
      );
      reply.send('superadmin logged in');
    });
  }
  done();
};
