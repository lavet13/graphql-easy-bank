import prisma from './prisma';
import generatePasswordHash from '../utils/auth/generate-password-hash';

let countDown = 0;

export default async function seed() {
  if (countDown > 0) {
    return;
  }

  countDown++;

  const password = 'password';
  const hashedPassword = await generatePasswordHash(password);

  await prisma.financialHistory.deleteMany({});
  await prisma.bankAccount.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.loanCalculation.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.comment.deleteMany({});

  const firstUser = await prisma.user.create({
    data: {
      name: 'user',
      email: 'user@mail.com',
      role: 'ADMIN',
      password: hashedPassword,
      financialHistory: {
        createMany: {
          data: [
            { income: 1, expenses: 2, creditScore: 2 },
            { income: 2, expenses: 3, creditScore: 4 },
          ],
        },
      },
      loans: {
        createMany: {
          data: [
            { term: 3, amount: 200, status: 'DEFAULTED', interestRate: 123 },
          ],
        },
      },
      bankAccounts: {
        create: {
          accountType: 'CREDIT',
          accountNumber: '424242424242424242',
        },
      },
    },
    include: {
      bankAccounts: true,
      loans: true,
      comments: true,
      financialHistory: true,
    },
  });

  const loan = await prisma.loan.findFirst();

  await prisma.comment.createMany({
    data: [
      { text: 'some text__1', loanId: loan?.id },
      { text: 'some text__2', loanId: loan?.id },
    ],
  });

  const comments = await prisma.comment.findMany({
    select: {
      id: true,
    },
  });

  const updatedUser = await prisma.user.update({
    where: {
      id: firstUser.id,
    },
    data: {
      comments: {
        connect: comments,
      },
    },
    include: {
      comments: true,
    },
  });
}

seed();
