/*
  Warnings:

  - A unique constraint covering the columns `[loanId]` on the table `LoanCalculation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[loanId]` on the table `comments` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `comments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `loanId` on table `comments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_loanId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "loanId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LoanCalculation_loanId_key" ON "LoanCalculation"("loanId");

-- CreateIndex
CREATE UNIQUE INDEX "comments_loanId_key" ON "comments"("loanId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
