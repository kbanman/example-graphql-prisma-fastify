import { RecipeListFunction, TypeInput } from 'supertokens-node/lib/build/types';
import { z } from 'zod';
import { env } from '@/environment';

const SupertokensConfig = z.object({
  SUPERTOKENS_CONNECTION_URL: z
    .string()
    .min(1)
    .default(() => (env.isProduction ? '' : 'http://supertokens:3567')),
  SUPERTOKENS_API_KEY: z
    .string()
    .min(1)
    .default(() => (env.isProduction ? '' : 'graphql-starter-supertokens-api-key')),

  SUPERTOKENS_APP_NAME: z
    .string()
    .min(1)
    .default(() => (env.isProduction ? '' : 'GraphQL Starter')),
  SUPERTOKENS_API_DOMAIN: z
    .string()
    .min(1)
    .default(() => (env.isProduction ? '' : 'http://localhost')),
  SUPERTOKENS_WEBSITE_DOMAIN: z
    .string()
    .min(1)
    .default(() => (env.isProduction ? '' : 'http://localhost')),
});
type SupertokensConfig = z.infer<typeof SupertokensConfig>;

const config = SupertokensConfig.parse(process.env);

export const superTokensConfig: TypeInput = {
  supertokens: {
    connectionURI: config.SUPERTOKENS_CONNECTION_URL,
    apiKey: config.SUPERTOKENS_API_KEY,
  },
  appInfo: {
    appName: config.SUPERTOKENS_APP_NAME,
    apiDomain: config.SUPERTOKENS_API_DOMAIN,
    websiteDomain: config.SUPERTOKENS_WEBSITE_DOMAIN,
  },
  recipeList: [] as RecipeListFunction[],
} as const;
