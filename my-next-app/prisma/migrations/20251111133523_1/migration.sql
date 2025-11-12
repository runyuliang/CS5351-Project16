-- DropIndex
DROP INDEX "BoardColumn_projectId_order_idx";

-- DropIndex
DROP INDEX "BoardTask_projectId_columnId_position_idx";

-- AlterTable
ALTER TABLE "BoardColumn" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BoardTask" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectMembers_AB_unique";
