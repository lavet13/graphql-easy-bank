/*
  Warnings:

  - The `loanId` column on the `comments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `loans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `loans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `loanId` on the `LoanCalculation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "LoanCalculation" DROP CONSTRAINT "LoanCalculation_loanId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_loanId_fkey";

-- AlterTable
ALTER TABLE "LoanCalculation" DROP COLUMN "loanId",
ADD COLUMN     "loanId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "loanId",
ADD COLUMN     "loanId" INTEGER;

-- AlterTable
ALTER TABLE "loans" DROP CONSTRAINT "loans_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "loans_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "LoanCalculation_loanId_idx" ON "LoanCalculation"("loanId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanCalculation" ADD CONSTRAINT "LoanCalculation_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
