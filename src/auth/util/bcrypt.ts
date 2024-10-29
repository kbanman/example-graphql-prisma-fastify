import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

export const verify = async (input: string, hash: string): Promise<boolean> => bcrypt.compare(input, hash);

export const generateHash = async (input: string, rounds = 14): Promise<string> => bcrypt.hash(input, rounds);

export const generatePassword = (length: number): string => {
  const random = crypto.randomBytes(length).toString('base64');
  // Remove any non-alphanumeric characters
  return random.replace(/[^a-zA-Z0-9]/g, '');
};
