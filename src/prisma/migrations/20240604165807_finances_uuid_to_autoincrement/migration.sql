/*
  Warnings:

  - The primary key for the `financial_histories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `financial_histories` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "financial_histories" DROP CONSTRAINT "financial_histories_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "financial_histories_pkey" PRIMARY KEY ("id");
