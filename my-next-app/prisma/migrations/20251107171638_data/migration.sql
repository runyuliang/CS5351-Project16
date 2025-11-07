-- AlterTable
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectMembers_AB_unique";
