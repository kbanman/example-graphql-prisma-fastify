import { z } from 'zod';
import dotenv from 'dotenv';

const a = dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const EnvironmentConfigSchema = z.object({
  NODE_ENV: z.coerce.string().toLowerCase().default('development'),
  PORT: z.coerce.number().default(8080),
  POSTGRES_CONNECTION_URL: z
    .string()
    .min(1)
    .default(() => (isProduction ? '' : 'postgresql://postgres:password@db:5432/db')),
  REDIS_CONNECTION_URL: z
    .string()
    .min(1)
    .default(() => (isProduction ? '' : 'redis://redis')),
  CORS_ORIGIN_URL: z
    .string()
    .min(1)
    .default(() => (isProduction ? '' : '*')),
  AWS_USER_ASSET_BUCKET: z.string().min(1),
});
type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema> & { isProduction: boolean };

export const env: EnvironmentConfig = {
  ...EnvironmentConfigSchema.parse(process.env),
  isProduction,
} as const;
