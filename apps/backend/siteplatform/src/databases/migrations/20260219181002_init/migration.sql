-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('READ', 'WRITE', 'FULL');

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRoute" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "method" "HttpMethod" NOT NULL,
    "actualPath" TEXT NOT NULL,
    "exposedPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientApp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPermission" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "scope" "PermissionScope" NOT NULL DEFAULT 'FULL',

    CONSTRAINT "ClientPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRoute_serviceId_method_actualPath_key" ON "ServiceRoute"("serviceId", "method", "actualPath");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRoute_method_exposedPath_key" ON "ServiceRoute"("method", "exposedPath");

-- CreateIndex
CREATE UNIQUE INDEX "ClientApp_name_key" ON "ClientApp"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ClientPermission_clientId_routeId_key" ON "ClientPermission"("clientId", "routeId");

-- AddForeignKey
ALTER TABLE "ServiceRoute" ADD CONSTRAINT "ServiceRoute_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPermission" ADD CONSTRAINT "ClientPermission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPermission" ADD CONSTRAINT "ClientPermission_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "ServiceRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
