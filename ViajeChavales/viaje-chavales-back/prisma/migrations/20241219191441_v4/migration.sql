/*
  Warnings:

  - You are about to drop the column `duration` on the `Trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "duration",
ADD COLUMN     "destails" TEXT;
