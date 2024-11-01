import { createId } from '@paralleldrive/cuid2';

interface IDefaultPayload {
  $errorId: string;
}

export interface IBaseErrorConstructorArgs {
  /**
   * Custom Codename for your error. Suggested naming convention would be in UPPER_SNAKE_CASE.
   */
  errorCodename: string;

  /**
   * General Error message.
   */
  message: string;

  /**
   * Will be used by REST endpoints.
   */
  httpStatusCode: number;

  /**
   * Any extra data that could be useful for the consumer.
   */
  payload?: Record<string, any>;

  /**
   * If the error is from a 3rd party or you're wrapping other errors, make sure to pass it here.
   */
  originalError?: Error;
}
/**
 * Few things to keep in mind when extending the Error Class and using TypeScript with it.
 *
 * - https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
 * - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
 */
export class BaseError extends Error {
  readonly errorId: string;
  readonly httpStatusCode: number;
  readonly errorCodename: string;
  readonly originalError?: Error;
  readonly extensions: { code: string };
  payload?: Readonly<IDefaultPayload> & Record<string, any>;

  constructor(args: IBaseErrorConstructorArgs) {
    super(args.message);

    // For tracing on backend logs
    this.errorId = createId();

    this.errorCodename = args.errorCodename;
    this.extensions = {
      code: this.errorCodename,
    };
    this.httpStatusCode = args.httpStatusCode;
    this.payload = {
      ...args.payload,
      $errorId: this.errorId,
    };
    this.originalError = args.originalError;

    // Always prepend the Error ID for tracing
    this.stack = `ErrorID: ${this.errorId}\n${this.stack}\n`;

    if (this.originalError) {
      this.stack += `Original Error Stack Trace: \n${this.originalError.stack}\n`;
    }

    // If desired, you could notify certain channels
    // on your organization here by extending the "args"
    // and doing a conditional here based on your needs such as
    // sending an email to system admins or developers that
    // something went wrong since a certain error happened.
  }
}
