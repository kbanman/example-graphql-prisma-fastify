import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import Fastify from 'fastify';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import { GraphQLScalarType } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { registerEnumType, buildSchema} from 'type-graphql'
import { Context, createContext } from '@/context'
import { PostResolver, SortOrder } from '@/posts/PostResolver'
import { UserResolver } from '@/users/UserResolver'
import {container} from "tsyringe";
import { authResolvers } from '@/auth';
import authPlugin from '@/auth/supertokens/fastify-plugin';
import { ErrorInterceptor } from './errors/error-interceptor';
import { env } from '@/environment'


const app = async () => {
  registerEnumType(SortOrder, {
    name: 'SortOrder',
  })

  const schema = await buildSchema({
    resolvers: [
      ...authResolvers,
      PostResolver,
      UserResolver,
    ],
    scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
    validate: { forbidUnknownValues: false },
    container: { get: (cls) => container.resolve(cls) },
    globalMiddlewares: [ErrorInterceptor],
  });

  const fastify = Fastify();

  const apollo = new ApolloServer<Context>({
    schema,
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });

  await apollo.start();

  fastify.register(authPlugin);
  await fastify.register(fastifyApollo(apollo), {
    context: createContext,
  });

  const port = env.PORT;
  const host = '0.0.0.0';

  try {
    await fastify.listen({ port,  host });
    console.log(`🚀 Server ready at http://${host}:${port}/graphql`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

app();
