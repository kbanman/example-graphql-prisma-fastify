import { NonEmptyArray } from 'type-graphql';
import { LoginResolver } from './resolvers/login';
import { RegisterResolver } from './resolvers/register';

export const authResolvers: NonEmptyArray<Function> = [
  RegisterResolver,
  LoginResolver,
];
