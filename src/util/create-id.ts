import { BadInputError } from '@/errors/bad-input-error';
import cuid from '@paralleldrive/cuid2';

export const createId = <T extends string>(prefix: T): `${T}-${string}` => `${prefix}-${cuid.createId()}`;

export const parseId = <T extends string>(prefix: T) => (id: string): `${T}-${string}` => {
  if (id.startsWith(`${prefix}-`) && id.length > prefix.length + 1) {
    return id as `${T}-${string}`;
  }
  throw new BadInputError(`Invalid ${prefix} ID: ${id}`);
}
