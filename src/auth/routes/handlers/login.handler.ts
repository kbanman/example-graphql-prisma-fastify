import { RouteHandler } from 'fastify';
import { LoginInput, loginUseCase } from '../../resolvers/login.js';
import { createContext } from '../../../context.js';
import { BadInputError } from '../../../errors/bad-input-error.js';

export const loginHandler: RouteHandler = async (req, reply) => {
  const input = parseLoginInput(req.body);
  const ctx = await createContext(req, reply);

  const result = await loginUseCase(ctx, input, req, reply);

  reply.send(result);
};

function parseLoginInput(input: any): LoginInput {
  if (!input.email || !input.password) {
    throw new BadInputError();
  }
  return {
    email: input.email,
    password: input.password,
  };
}