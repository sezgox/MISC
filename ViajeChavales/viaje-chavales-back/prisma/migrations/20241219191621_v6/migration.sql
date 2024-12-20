/*
  Warnings:

  - You are about to drop the column `destails` on the `Trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "destails",
ADD COLUMN     "details" TEXT;
