import { BaseError } from './base-error';

export class BadInputError extends BaseError {
  constructor(message?: string, payload?: Record<string, any>) {
    super({
      errorCodename: 'BAD_INPUT',
      httpStatusCode: 400,
      message: message ?? 'Bad input.',
      payload,
    });
  }
}
