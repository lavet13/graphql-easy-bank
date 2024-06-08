import { ResolversComposition } from '@graphql-tools/resolvers-composition';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';
import { ContextValue } from '../../context';
import { parseIntSafe } from '../../helpers/parse-int-safe';

// we don't have to do like that
export const validLoanId =
  (): ResolversComposition<GraphQLFieldResolver<any, ContextValue, any>> =>
  next =>
  (parent, args, context, info) => {
    const loanId = parseIntSafe(args.id);

    if (loanId === null) {
      return Promise.reject(
        new GraphQLError(`Invalid loan id.`),
      );
    }

    return next(parent, args, context, info);
  };
