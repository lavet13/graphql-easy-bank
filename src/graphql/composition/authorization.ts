import { ResolversComposition } from '@graphql-tools/resolvers-composition';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';
import { ContextValue } from '../../context';

export const isAuthenticated =
  (): ResolversComposition<GraphQLFieldResolver<any, ContextValue, any>> =>
  next =>
  async (parent, args, ctx, info) => {
    const me = ctx.me;
    console.log({ me });

    if (!me) {
      throw new GraphQLError('Отказ в доступе. Не авторизован.', {
        extensions: { statusCode: 401 },
      });
    }

    return next(parent, args, ctx, info);
  };

export const isAdmin =
  (): ResolversComposition<GraphQLFieldResolver<any, ContextValue, any>> =>
  next =>
  async (parent, args, ctx, info) => {
    const me = ctx.me;
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: me!.id,
      },
    });

    if (user!.role !== 'ADMIN') {
      throw new GraphQLError('Нет прав!', { extensions: { statusCode: 401 } });
    }

    return next(parent, args, ctx, info);
  };
