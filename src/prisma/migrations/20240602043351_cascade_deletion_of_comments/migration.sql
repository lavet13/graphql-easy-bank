-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_loanId_fkey";

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
