/*
  Warnings:

  - Made the column `currentBalance` on table `financial_histories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "financial_histories" ALTER COLUMN "currentBalance" SET NOT NULL;
