import { PrismaClient } from '@prisma/client';
import userExtension from './extensions/user.extensions';

const prisma = new PrismaClient().$extends(userExtension);

export default prisma;
