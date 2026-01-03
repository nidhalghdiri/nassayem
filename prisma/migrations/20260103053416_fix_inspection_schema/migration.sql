/*
  Warnings:

  - You are about to drop the column `unitId` on the `Inspection` table. All the data in the column will be lost.
  - Added the required column `checklist` to the `Inspection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Inspection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_unitId_fkey";

-- AlterTable
ALTER TABLE "Inspection" DROP COLUMN "unitId",
ADD COLUMN     "checklist" JSONB NOT NULL,
ADD COLUMN     "issues" JSONB,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "parentTaskId" TEXT;

-- CreateIndex
CREATE INDEX "Inspection_taskId_idx" ON "Inspection"("taskId");

-- CreateIndex
CREATE INDEX "Inspection_inspectorId_idx" ON "Inspection"("inspectorId");

-- CreateIndex
CREATE INDEX "Inspection_status_idx" ON "Inspection"("status");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
