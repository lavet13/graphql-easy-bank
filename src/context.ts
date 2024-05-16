import { YogaInitialContext } from 'graphql-yoga';
import prisma from './prisma/prisma';

export type ContextValue = {
  prisma: typeof prisma;
} & YogaInitialContext;

export async function createContext({}: YogaInitialContext): Promise<ContextValue> {
  return { prisma } as ContextValue;
}
