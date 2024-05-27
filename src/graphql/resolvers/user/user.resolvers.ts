import { Resolvers } from '../../__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { isAuthenticated } from '../../composition/authorization';
import { GraphQLError } from 'graphql';

const resolvers: Resolvers = {
  Query: {
    me(_, __, ctx) {
      return ctx.prisma.user.findFirst({
        where: {
          id: ctx.me!.id,
        },
      });
    }
  },
  Mutation: {
    async login(_, args, ctx) {
      const { login, password } = args.loginInput;
      const { token } = await ctx.prisma.user.login(login, password);

      // 1 day
      const expires =
        Date.now() + Date.parse(new Date(1000 * 60 * 60 * 24).toString());

      try {
        await ctx.request.cookieStore?.set({
          name: 'authorization',
          value: token,
          sameSite: 'none',
          secure: true,
          httpOnly: true,
          domain: null,
          expires,
          path: '/',
        });
      } catch(reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(`Failed while setting the cookie`);
      }

      return { token };
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.me': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
