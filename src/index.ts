import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import Fastify from 'fastify';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import { GraphQLScalarType } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { registerEnumType, buildSchema} from 'type-graphql'
import { Context, createContext } from './context'
import { CreatePostInput, PostResolver, SortOrder } from './posts/PostResolver'
import { UserResolver } from './users/UserResolver'


const app = async () => {
  registerEnumType(SortOrder, {
    name: 'SortOrder',
  })

  const schema = await buildSchema({
    resolvers: [PostResolver, UserResolver, CreatePostInput],
    scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
    validate: { forbidUnknownValues: false }
  });

  const fastify = Fastify();

  const apollo = new ApolloServer<Context>({
    schema,
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });

  await apollo.start();

  await fastify.register(fastifyApollo(apollo), {
    context: createContext,
  });

  console.log(`🚀 Server ready`);
}

app();
