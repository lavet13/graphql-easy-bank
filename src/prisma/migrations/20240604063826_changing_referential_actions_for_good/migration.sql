-- DropForeignKey
ALTER TABLE "LoanCalculation" DROP CONSTRAINT "LoanCalculation_loanId_fkey";

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_loanId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "financial_histories" DROP CONSTRAINT "financial_histories_userId_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_userId_fkey";

-- DropIndex
DROP INDEX "LoanCalculation_loanId_key";

-- AlterTable
ALTER TABLE "bank_accounts" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "loanId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "financial_histories" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "loans" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "financial_histories" ADD CONSTRAINT "financial_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanCalculation" ADD CONSTRAINT "LoanCalculation_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
