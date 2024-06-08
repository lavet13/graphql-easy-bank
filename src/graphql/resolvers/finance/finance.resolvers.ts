import { Resolvers } from '../../__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { GraphQLError } from 'graphql';
import { applyConstraints } from '../../../helpers/apply-constraints';
import { parseIntSafe } from '../../../helpers/parse-int-safe';
import { isAuthenticated } from '../../composition/authorization';

const resolvers: Resolvers = {
  Query: {
    async financialHistory(_, args, ctx) {
      const userId = ctx.me!.id;

      enum PaginationDirection {
        NONE = 'NONE',
        FORWARD = 'FORWARD',
        BACKWARD = 'BACKWARD',
      }

      const direction: PaginationDirection = args.input.after
        ? PaginationDirection.FORWARD
        : args.input.before
          ? PaginationDirection.BACKWARD
          : PaginationDirection.NONE;
      console.log({ before: args.input.before, after: args.input.after });

      const take = Math.abs(
        applyConstraints({
          type: 'take',
          min: 1,
          max: 50,
          value: args.input.take ?? 30,
        }),
      );

      let cursor =
        direction === PaginationDirection.NONE
          ? undefined
          : {
              id:
                direction === PaginationDirection.FORWARD
                  ? args.input.after ?? undefined
                  : args.input.before ?? undefined,
            };

      // in case where we might get cursor which points to nothing
      if (direction !== PaginationDirection.NONE) {
        // checking if the cursor pointing to the loan doesn't exist,
        // otherwise skip
        const cursorFinance = await ctx.prisma.financialHistory.findUnique({
          where: { id: cursor?.id, userId },
        });

        if (!cursorFinance) {
          if (direction === PaginationDirection.FORWARD) {
            // this shit is shit and isn't work for me,
            // or because perhaps I am retard ☺️💕
            //
            // const previousValidPost = await ctx.prisma.loan.findFirst({
            //   where: { id: { lt: args.input.after } },
            //   orderBy: { id: 'desc' },
            // });
            // console.log({ previousValidPost });
            // cursor = previousValidPost ? { id: previousValidPost.id } : undefined;

            cursor = { id: -1 }; // we guarantee financialHistory are empty
          } else if (direction === PaginationDirection.BACKWARD) {
            const nextValidFinance = await ctx.prisma.financialHistory.findFirst({
              where: { id: { gt: args.input.before }, userId },
              orderBy: {
                id: 'asc',
              },
            });
            console.log({ nextValidFinance });

            cursor = nextValidFinance ? { id: nextValidFinance.id } : undefined;
          }
        }
      }

      // fetching financialHistory with extra one, so to determine if there's more to fetch
      const financialHistory = await ctx.prisma.financialHistory.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra loan for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor loan for the next/previous page
        orderBy: { id: 'asc' }, // Order by id for consistent pagination
        where: { userId },
      });

      // If no results are retrieved, it means we've reached the end of the
      // pagination or because we stumble upon invalid cursor, so on the
      // client we just clearing `before` and `after` cursors to get first financialHistory
      // forward pagination could have no financialHistory at all,
      // or because cursor is set to `{ id: -1 }`, for backward pagination
      // the only thing would happen if only financialHistory are empty!
      if (financialHistory.length === 0) {
        return {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      // If the number of financialHistory fetched is less than or equal to the
      // `take` value, you include all the financialHistory in the `edges` array.
      // However, if the number of financialHistory fetched is greater than
      // the `take` value, you exclude the extra loan from
      // the `edges` array by slicing the financialHistory array.
      const edges =
        financialHistory.length <= take
          ? financialHistory
          : direction === PaginationDirection.BACKWARD
            ? financialHistory.slice(1, financialHistory.length)
            : financialHistory.slice(0, -1);

      const hasMore = financialHistory.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      // This is where the condition `edges.length < financialHistory.length` comes into
      // play. If the length of the `edges` array is less than the length
      // of the `financialHistory` array, it means that the extra loan was fetched and
      // excluded from the `edges` array. That implies that there are more
      // financialHistory available to fetch in the current pagination direction.
      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE && edges.length < financialHistory.length);
      // /\
      // |
      // |
      // NOTE: This condition `edges.length < financialHistory.length` is essentially
      // checking the same thing as `hasMore`, which is whether there are more
      // financialHistory available to fetch. Therefore, you can safely replace
      // `edges.length < financialHistory.length` with hasMore in the condition for
      // determining hasNextPage. Both conditions are equivalent and will
      // produce the same result.

      const hasPreviousPage =
        direction === PaginationDirection.FORWARD ||
        (direction === PaginationDirection.BACKWARD && hasMore);

      return {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },
    async currentBalance(_, __, ctx) {
      const financeUnit = await ctx.prisma.financialHistory.findFirst({
        where: {
          user: {
            id: ctx.me!.id,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          currentBalance: true,
        },
        take: 1,
      });

      if(!financeUnit) return 0;

      return financeUnit.currentBalance.toNumber();
    },
  }
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.financialHistory': [isAuthenticated()],
  'Query.currentBalance': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
