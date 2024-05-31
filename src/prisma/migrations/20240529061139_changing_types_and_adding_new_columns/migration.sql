/*
  Warnings:

  - You are about to alter the column `creditScore` on the `financial_histories` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - Changed the type of `income` on the `financial_histories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expenses` on the `financial_histories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "LoanCalculation_loanId_key";

-- AlterTable
ALTER TABLE "LoanCalculation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "financial_histories" DROP COLUMN "income",
ADD COLUMN     "income" MONEY NOT NULL,
DROP COLUMN "expenses",
ADD COLUMN     "expenses" MONEY NOT NULL,
ALTER COLUMN "creditScore" SET DATA TYPE SMALLINT;

-- CreateIndex
CREATE INDEX "LoanCalculation_loanId_idx" ON "LoanCalculation"("loanId");
