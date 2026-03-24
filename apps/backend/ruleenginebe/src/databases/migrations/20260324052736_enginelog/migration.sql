-- CreateTable
CREATE TABLE "EngineLog" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "requestBody" JSONB NOT NULL,
    "responseBody" JSONB NOT NULL,
    "executionTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngineLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EngineLog_userId_idx" ON "EngineLog"("userId");

-- CreateIndex
CREATE INDEX "EngineLog_repositoryId_idx" ON "EngineLog"("repositoryId");

-- AddForeignKey
ALTER TABLE "EngineLog" ADD CONSTRAINT "EngineLog_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
