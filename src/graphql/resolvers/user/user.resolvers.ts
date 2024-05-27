import { Resolvers } from '../../__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { isAuthenticated } from '../../composition/authorization';

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
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.me': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
