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

  const deleteFinancialHistories = prisma.financialHistory.deleteMany({});
  const deleteBankAccounts = prisma.bankAccount.deleteMany({});
  const deleteLoans = prisma.loan.deleteMany({});
  const deleteLoanCalculations = prisma.loanCalculation.deleteMany({});
  const deleteUsers = prisma.user.deleteMany({});
  const deleteComments = prisma.comment.deleteMany({});
  await prisma.$transaction([
    deleteFinancialHistories,
    deleteBankAccounts,
    deleteLoans,
    deleteLoanCalculations,
    deleteUsers,
    deleteComments,
  ]);

  const firstUser = await prisma.user.create({
    data: {
      name: 'user',
      email: 'user@mail.com',
      role: 'ADMIN',
      password: hashedPassword,
      financialHistory: {
        createMany: {
          data: [
            { income: 1, expenses: 2, currentBalance: -1 },
            { income: 2, expenses: 3, currentBalance: -2 },
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

  await prisma.comment.create({
    data: {
      text: 'some text',
      loanId: loan?.id,
      userId: firstUser.id,
    },
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
