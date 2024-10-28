import cuid from '@paralleldrive/cuid2';

export const createId = <T extends string>(prefix: T): `${T}-${string}` => `${prefix}-${cuid.createId()}`;

export const validateId = <T extends string>(prefix: T) => (input: string): input is `${T}-${string}` => input.startsWith(`${prefix}-`);