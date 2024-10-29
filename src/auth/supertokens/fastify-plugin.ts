import type { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import supertokens from 'supertokens-node';
import { plugin, errorHandler } from 'supertokens-node/framework/fastify';
import Dashboard from 'supertokens-node/recipe/dashboard';
import EmailPassword from 'supertokens-node/recipe/emailpassword';

import { superTokensConfig } from './config';
import { SessionRecipe } from './session.recipe';
import { UserService } from '@/users/user-service';
import { TenantId, TenantService } from '@/tenants/tenant-service';
import { container } from 'tsyringe';

    const tenantService = container.resolve(TenantService);
    const userService = container.resolve(UserService);

    supertokens.init({
      ...superTokensConfig,
      framework: 'fastify',
      appInfo: {
        ...superTokensConfig.appInfo,
        apiBasePath: '/graphql',
      },
      recipeList: [
        Dashboard.init(),
        EmailPassword.init({
          override: {
            functions: (originalImplementation) => {
              return {
                ...originalImplementation,
    
                // override the email password sign up function
                signUp: async function (input) {
                  const response = await originalImplementation.signUp(input);
    
                  if (response.status === 'OK' && response.user.loginMethods.length === 1) {
                    console.log('SIGNUP!!!!!!', input);
                    const tenant = await tenantService.create({
                      name: 'TODO',
                    });
                    const user = await userService.create(tenant.id as TenantId, {
                      name: input.email,
                      email: input.email,
                      password: input.password,
                    });
                    await supertokens.createUserIdMapping({ superTokensUserId: response.user.id, externalUserId: user.id });
    
                    // we modify the response object to have the custom user ID.
                    response.user.id = user.id;
                    response.user.loginMethods[0].recipeUserId = new supertokens.RecipeUserId(user.id);
                  }
    
                  return response;
                },
              };
            },
          },
          signUpFeature: {
            formFields: [
              {
                id: 'name',
              },
              {
                id: 'companyName',
              },
            ],
          },
        }),
        SessionRecipe,
      ],
    });

  async function auth(server: FastifyInstance) {
    server.setErrorHandler(errorHandler());
    server.register(plugin);
  }


export default fastifyPlugin(auth);
