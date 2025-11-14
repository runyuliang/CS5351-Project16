/*
  Warnings:

  - You are about to drop the column `dueDate` on the `BoardColumn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BoardColumn" DROP COLUMN "dueDate";

-- AlterTable
ALTER TABLE "BoardTask" ADD COLUMN     "actualHours" INTEGER,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "estimatedHours" INTEGER;
