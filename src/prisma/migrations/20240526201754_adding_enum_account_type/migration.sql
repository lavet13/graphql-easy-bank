/*
  Warnings:

  - Changed the type of `accountType` on the `bank_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CHECKING', 'CREDIT');

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "accountType",
ADD COLUMN     "accountType" "AccountType" NOT NULL;
