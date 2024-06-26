import { Resolvers } from '../../__generated__/types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { GraphQLError } from 'graphql';
import { applyConstraints } from '../../../helpers/apply-constraints';
import { parseIntSafe } from '../../../helpers/parse-int-safe';
import {
  PrismaClientKnownRequestError,
  Decimal,
} from '@prisma/client/runtime/library';
import { calculateInterestRate } from '../../../utils/loan/calculate-interest-rate';
import { calculateCreditScore } from '../../../utils/loan/calculate-credit-score';
import { calculateTotalPayment } from '../../../utils/loan/calculate-total-payment';
import { isAdmin, isAuthenticated } from '../../composition/authorization';

const resolvers: Resolvers = {
  Query: {
    async loans(_, args, ctx) {
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
        const cursorLoan = await ctx.prisma.loan.findUnique({
          where: { id: cursor?.id },
        });

        if (!cursorLoan) {
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

            cursor = { id: -1 }; // we guarantee credits are empty
          } else if (direction === PaginationDirection.BACKWARD) {
            const nextValidLoan = await ctx.prisma.loan.findFirst({
              where: { id: { gt: args.input.before } },
              orderBy: {
                id: 'asc',
              },
            });
            console.log({ nextValidLoan });

            cursor = nextValidLoan ? { id: nextValidLoan.id } : undefined;
          }
        }
      }

      // fetching credits with extra one, so to determine if there's more to fetch
      const credits = await ctx.prisma.loan.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra loan for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor loan for the next/previous page
        orderBy: { id: 'asc' }, // Order by id for consistent pagination
      });

      // If no results are retrieved, it means we've reached the end of the
      // pagination or because we stumble upon invalid cursor, so on the
      // client we just clearing `before` and `after` cursors to get first credits
      // forward pagination could have no credits at all,
      // or because cursor is set to `{ id: -1 }`, for backward pagination
      // the only thing would happen if only credits are empty!
      if (credits.length === 0) {
        return {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      // If the number of credits fetched is less than or equal to the
      // `take` value, you include all the credits in the `edges` array.
      // However, if the number of credits fetched is greater than
      // the `take` value, you exclude the extra loan from
      // the `edges` array by slicing the credits array.
      const edges =
        credits.length <= take
          ? credits
          : direction === PaginationDirection.BACKWARD
            ? credits.slice(1, credits.length)
            : credits.slice(0, -1);

      const hasMore = credits.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      // This is where the condition `edges.length < credits.length` comes into
      // play. If the length of the `edges` array is less than the length
      // of the `credits` array, it means that the extra loan was fetched and
      // excluded from the `edges` array. That implies that there are more
      // credits available to fetch in the current pagination direction.
      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE &&
          edges.length < credits.length);
      // /\
      // |
      // |
      // NOTE: This condition `edges.length < credits.length` is essentially
      // checking the same thing as `hasMore`, which is whether there are more
      // credits available to fetch. Therefore, you can safely replace
      // `edges.length < credits.length` with hasMore in the condition for
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
    async loanById(_, args, ctx) {
      const id = parseIntSafe(args.id);

      if (id === null) {
        return Promise.reject(new GraphQLError(`Invalid loan id.`));
      }

      return ctx.prisma.loan
        .findUniqueOrThrow({
          where: {
            id,
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            return Promise.reject(
              new GraphQLError(`Cannot find post by id \`${id}\``),
            );
          }

          return Promise.reject(err);
        });
    },
  },
  Mutation: {
    async updateLoan(_, args, ctx) {
      const { id, term, amount, status, text } = args.input;

      const loan = await ctx.prisma.loan.findUnique({
        where: {
          id: +id,
        },
        include: {
          user: {
            include: {
              financialHistory: {
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      });

      if (!loan) {
        throw new GraphQLError(`Loan with ID \`${id}\` not found.`);
      }

      const user = loan.user!;
      const financialHistories = user.financialHistory;
      const latestFinancialHistory = user.financialHistory?.[0] || null;

      const creditScore = calculateCreditScore(financialHistories, term);
      const interestRate = calculateInterestRate(creditScore, amount, term);
      const totalPayment = calculateTotalPayment(amount, interestRate, term);

      console.log({ latestFinancialHistory });
      let currentBalance =
        latestFinancialHistory?.currentBalance ?? new Decimal(0);
      let income = latestFinancialHistory?.income ?? new Decimal(0);
      let expenses = latestFinancialHistory?.expenses ?? new Decimal(0);
      console.log({ currentBalance, income, expenses });

      if (status === 'APPROVED') {
        currentBalance = currentBalance.plus(new Decimal(amount.toString()));
        income = income.plus(new Decimal(amount.toString()));
        // new financial history record
        await ctx.prisma.financialHistory.create({
          data: {
            userId: user.id,
            income: income.toNumber(),
            expenses: expenses.toNumber(),
            currentBalance: currentBalance.toNumber(),
            creditScore,
          },
        });
        await ctx.prisma.loanCalculation.create({
          data: {
            totalPayment,
            loan: {
              connect: {
                id: loan.id,
              },
            },
          },
        });
      } else if (status === 'PAID') {
        currentBalance = currentBalance.minus(new Decimal(amount.toString()));
        expenses = expenses.plus(new Decimal(amount.toString()));
        // new financial history record
        await ctx.prisma.financialHistory.create({
          data: {
            userId: user.id,
            income: income.toNumber(),
            expenses: expenses.toNumber(),
            currentBalance: currentBalance.toNumber(),
            creditScore,
          },
        });
        await ctx.prisma.loanCalculation.create({
          data: {
            totalPayment,
            loan: {
              connect: {
                id: loan.id,
              },
            },
          },
        });
      }

      return ctx.prisma.loan.update({
        where: {
          id: +id,
        },
        data: {
          term,
          amount,
          status,
          interestRate,
          ...(text.length !== 0
            ? {
                comment: {
                  upsert: {
                    update: {
                      text,
                    },
                    create: {
                      text,
                      user: {
                        connect: {
                          id: user.id,
                        },
                      },
                    },
                  },
                },
              }
            : {}),
        },
      });
    },
    async createLoan(_, args, ctx) {
      const term = args.input.term;
      const amount = args.input.amount;

      const financialHistory = await ctx.prisma.financialHistory.findMany({
        where: {
          user: {
            id: ctx.me!.id,
          },
        },
      });

      const creditScore = calculateCreditScore(financialHistory, term);
      const interestRate = calculateInterestRate(creditScore, amount, term);

      return ctx.prisma.loan.create({
        data: {
          term,
          amount,
          interestRate,
          user: {
            connect: {
              id: ctx.me!.id,
            },
          },
        },
      });
    },
    async delLoan(_, args, ctx) {
      const loanIdToDelete = args.id;

      try {
        await ctx.prisma.loan.delete({
          where: {
            id: +loanIdToDelete,
          },
        });

        return true;
      } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new GraphQLError(
              `Loan with ID \`${loanIdToDelete}\` not found and cannot be deleted.`,
            );
          }
        }
        console.log({ err });
        throw new GraphQLError('Unknown error!');
      }
    },
  },
  Loan: {
    user(parent, _, ctx) {
      const userId = parent.userId;
      if (!userId) return null;

      return ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
    },
    comment(parent, _, ctx) {
      return ctx.prisma.comment.findUnique({
        where: {
          loanId: parent.id,
        },
      });
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.loans': [isAuthenticated(), isAdmin()],
  'Mutation.createLoan': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
