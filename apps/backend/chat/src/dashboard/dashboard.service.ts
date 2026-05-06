import { DatabaseClient } from "../db/db";
import { logger } from "@finverse/logger";
import { config } from "../config";
import { APP_CONSTANTS } from "../constants/constants";
import { DatabaseError, NotFoundError } from "../errors";
import { tryCatch } from "../utils/try-catch";
import { createDashboardSchema, updateDashboardSchema } from "./dashboard.validation";
import type {
  CreateDashboardInput,
  DashboardListInput,
  UpdateDashboardInput,
} from "../types/dashboard.types";

const serviceLogger = logger.child({ service: "dashboard", app: "chat" });
// Creates a new dashboard record with validated input data
export async function createDashboard(data: CreateDashboardInput) {
  const payload = createDashboardSchema.parse(data);
  const prisma = DatabaseClient.getInstance();

  const [error, created] = await tryCatch(
    prisma.whatsAppChatSupportDashboard.create({ data: payload as any })
  );

  if (error) throw new DatabaseError("Failed to create dashboard record", { error: error.message });
  if (config.logging.db) serviceLogger.info({ id: created?.id }, "Created dashboard record");

  return created;
}

// Fetches a single dashboard record by ID
export async function getDashboardById(id: number) {
  const prisma = DatabaseClient.getInstance();

  const [error, record] = await tryCatch(
    prisma.whatsAppChatSupportDashboard.findUnique({ where: { id } })
  );

  if (error) throw new DatabaseError("Failed to fetch dashboard record", { error: error.message });
  if (!record) throw new NotFoundError("Dashboard record");
  if (config.logging.db) serviceLogger.debug({ id }, "Fetched dashboard record");
  return record;
}

// Finds a dashboard record for an active chat session between a bot and user
export async function getActiveDashboardRecord(botNumber: string, userNumber: string) {
  const prisma = DatabaseClient.getInstance();

  const [error, records] = await tryCatch(
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM whatsapp_chat_support_dashboard
      WHERE bot_number = ${BigInt(botNumber)}
        AND user_number = ${BigInt(userNumber)}
        AND status IN (${APP_CONSTANTS.MSG_STATUS.OPEN}, ${APP_CONSTANTS.MSG_STATUS.HOLD})
      ORDER BY id DESC
      LIMIT 1
    `
  );

  if (error) throw new DatabaseError("Failed to fetch active dashboard record", { error: error.message });
  const record = records?.[0] ?? null;
  if (config.logging.db && record) serviceLogger.debug({ botNumber, userNumber, id: record.id }, "Fetched active dashboard record");

  return record;
}

// Fetches a paginated list of dashboard records with total count
export async function getDashboardList(input: DashboardListInput = {}) {
  // Normalize pagination parameters with safe defaults
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.max(1, input.limit ?? 20);
  const skip = (page - 1) * limit;

  const prisma = DatabaseClient.getInstance();

  const [error, result] = await tryCatch(
    prisma.$transaction([
      prisma.whatsAppChatSupportDashboard.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.whatsAppChatSupportDashboard.count(),
    ])
  );

  if (error) throw new DatabaseError("Failed to fetch dashboard list", { error: error.message });
  if (!result) throw new DatabaseError("Failed to fetch dashboard list", { error: "Empty transaction result" });
  if (config.logging.db) serviceLogger.debug({ page, limit, total: result[1] }, "Fetched dashboard list");

  const [items, total] = result;

  // Return paginated response with metadata
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Updates an existing dashboard record after validation
export async function updateDashboard(id: number, data: UpdateDashboardInput) {
  const payload = updateDashboardSchema.parse(data);
  const prisma = DatabaseClient.getInstance();

  // Verify record exists before attempting update
  const [existingError, existingRecord] = await tryCatch(
    prisma.whatsAppChatSupportDashboard.findUnique({
      where: { id },
    })
  );

  if (existingError) {
    throw new DatabaseError("Failed to fetch dashboard record for update", {
      error: existingError.message,
    });
  }

  if (!existingRecord) throw new NotFoundError("Dashboard record");

  const [error, updated] = await tryCatch(
    prisma.whatsAppChatSupportDashboard.update({
      where: { id },
      data: payload as any,
    })
  );

  if (error) throw new DatabaseError("Failed to update dashboard record", { error: error.message });
  if (config.logging.db) serviceLogger.info({ id }, "Updated dashboard record");

  return updated;
}

// Deletes a single dashboard record by ID
export async function deleteDashboard(id: number) {
  const prisma = DatabaseClient.getInstance();

  // Verify record exists before attempting delete
  const [existingError, existingRecord] = await tryCatch(
    prisma.whatsAppChatSupportDashboard.findUnique({
      where: { id },
    })
  );

  if (existingError) {
    throw new DatabaseError("Failed to fetch dashboard record for delete", {
      error: existingError.message,
    });
  }

  if (!existingRecord) throw new NotFoundError("Dashboard record");

  const [error, deleted] = await tryCatch(
    prisma.whatsAppChatSupportDashboard.delete({
      where: { id },
    })
  );

  if (error) throw new DatabaseError("Failed to delete dashboard record", { error: error.message });
  if (config.logging.db) serviceLogger.info({ id }, "Deleted dashboard record");

  return deleted;
}

// Bulk deletes multiple dashboard records by IDs
export async function deleteDashboards(ids: number[]) {
  const prisma = DatabaseClient.getInstance();

  // Delete all records matching the provided IDs
  const [error, deleted] = await tryCatch(
    prisma.whatsAppChatSupportDashboard.deleteMany({
      where: { id: { in: ids, } },
    })
  );

  if (error) throw new DatabaseError("Failed to bulk delete dashboard records", { error: error.message });
  if (config.logging.db && deleted) serviceLogger.info({ count: deleted.count }, "Bulk deleted dashboard records");

  return deleted;
}
