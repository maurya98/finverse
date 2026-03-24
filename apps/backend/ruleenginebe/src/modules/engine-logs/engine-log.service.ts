import { prisma } from "../../databases/client";

export type EngineLogListInput = {
  repositoryId: string;
  userId?: bigint;
  skip?: number;
  take?: number;
};

export type EngineLogOut = {
  id: string;
  userId: string;
  repositoryId: string;
  requestBody: unknown;
  responseBody: unknown;
  executionTime: number;
  createdAt: Date;
};

export class EngineLogService {
  async list(input: EngineLogListInput): Promise<EngineLogOut[]> {
    const { repositoryId, userId, skip = 0, take = 50 } = input;
    const rows = await prisma.engineLog.findMany({
      where: {
        repositoryId,
        ...(userId != null ? { userId } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    return rows.map((row) => ({
      id: row.id.toString(),
      userId: row.userId.toString(),
      repositoryId: row.repositoryId,
      requestBody: row.requestBody,
      responseBody: row.responseBody,
      executionTime: row.executionTime,
      createdAt: row.createdAt,
    }));
  }
}
