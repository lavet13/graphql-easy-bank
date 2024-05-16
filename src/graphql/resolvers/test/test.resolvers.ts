import { GraphQLError } from 'graphql';
import { Prisma } from '@prisma/client';

import DateScalar from '../../scalars/date.scalars';
import { Resolvers } from '../../__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';

const resolvers: Resolvers = {
  Date: DateScalar,
  Query: {
    foods(_, __, context) {
      return context.prisma.food.findMany();
    }
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
};

export default composeResolvers(resolvers, resolversComposition);
