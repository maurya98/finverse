/*
  Warnings:

  - The `content` column on the `Blob` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Blob" DROP COLUMN "content",
ADD COLUMN     "content" JSONB;
