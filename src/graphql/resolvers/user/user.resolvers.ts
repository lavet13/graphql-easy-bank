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
      console.log({ me: ctx.me });
      return ctx.prisma.user.findFirst({
        where: {
          id: ctx.me!.id,
        },
      });
    },
  },
  Mutation: {
    async login(_, args, ctx) {
      const { login, password } = args.loginInput;
      const { token } = await ctx.prisma.user.login(login, password);

      try {
        await ctx.request.cookieStore?.set({
          name: 'authorization',
          value: token,
          sameSite: 'none',
          secure: true,
          httpOnly: true,
          domain: null,
          expires: null,
          path: '/',
        });
      } catch (reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(`Failed while setting the cookie`);
      }

      return { token };
    },
    async signup(_, args, ctx) {
      const { email, name, password } = args.signupInput;

      const { token } = await ctx.prisma.user.signup(
        email,
        name.length !== 0 ? 'noname' : name,
        password
      );

      try {
        await ctx.request.cookieStore?.set({
          name: 'authorization',
          value: token,
          sameSite: 'none',
          secure: true,
          httpOnly: true,
          domain: null,
          expires: null,
          path: '/',
        });
      } catch (reason) {
        console.error(`It failed: ${reason}`);
        throw new GraphQLError(`Failed while setting the cookie`);
      }

      // console.log({ authorization: await ctx.request.cookieStore?.get('authorization') });
      // console.log({ cookies: await ctx.request.cookieStore?.getAll()});

      return { token };
    },
    async logout(_, __, ctx) {
      try {
        await ctx.request.cookieStore?.delete('authorization');

        return true;
      } catch (err: any) {
        console.log({ err });
        throw new GraphQLError(`Error occured while logging out!`);
      }
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.me': [isAuthenticated()],
};

export default composeResolvers(resolvers, resolversComposition);
