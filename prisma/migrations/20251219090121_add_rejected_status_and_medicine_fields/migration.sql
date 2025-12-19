-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "sideEffects" TEXT,
ADD COLUMN     "usage" TEXT;
