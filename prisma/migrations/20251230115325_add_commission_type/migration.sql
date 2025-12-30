-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "commission_type" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE';
