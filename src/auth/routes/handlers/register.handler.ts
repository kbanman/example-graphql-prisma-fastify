import { RouteHandler } from 'fastify';
import { registerUseCase } from '../../resolvers/register.js';

export const registerHandler: RouteHandler = async (req, res) => {
  const { companyName, email, name, password } = req.body as any;

  await registerUseCase(
    {
      companyName,
      email,
      name,
      password,
    },
  );

  res.send();
};
