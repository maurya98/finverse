-- AlterTable
ALTER TABLE "ClientApp" ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ClientPermission" ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ServiceRoute" ALTER COLUMN "isActive" SET DEFAULT false;
