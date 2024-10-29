import { MiddlewareFn } from 'type-graphql';
import { BaseError } from './base-error';
import { env } from '@/environment';

export const ErrorInterceptor: MiddlewareFn<any> = async ({ context, info }, next) => {
  try {
    return await next();
  } catch (err) {
    // Hide errors from db like printing sql query
    if (env.NODE_ENV === 'development' || err instanceof BaseError) {
      console.error('Rethrowing base error');
      throw err;
    }

    // Rethrow the error
    throw new Error('Internal server error');
  }
};