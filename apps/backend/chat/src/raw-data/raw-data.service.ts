import { Prisma } from "../generated/prisma/client";
import { logger } from "@finverse/logger";
import { DatabaseClient } from "../db/db";
import { config } from "../config";
import { DatabaseError, NotFoundError } from "../errors";
import { tryCatch } from "../utils/try-catch";
import {
  createRawDataSchema,
  updateRawDataSchema,
} from "./raw-data.validation";
import type {
  CreateRawDataInput,
  RawDataListInput,
  UpdateRawDataInput,
} from "../types/raw-data.types";

const serviceLogger = logger.child({ service: "raw-data", app: "chat" });

// Creates a new raw data record with validated input data
export async function createRawData(data: CreateRawDataInput) {
  const payload = createRawDataSchema.parse(data);
  const prisma = DatabaseClient.getInstance();
  const normalizedPayload = normalizeRawDataPayload(payload);

  const [error, created] = await tryCatch(
    prisma.whatsAppChatSupportRawData.create({ data: normalizedPayload })
  );

  if (error) throw new DatabaseError("Failed to create raw data record", { error: error.message });
  if (config.logging.db) serviceLogger.info({ id: created?.id }, "Created raw data record");

  return created;
}

// Fetches a single raw data record by ID
export async function getRawDataById(id: number) {
  const prisma = DatabaseClient.getInstance();

  const [error, record] = await tryCatch(
    prisma.whatsAppChatSupportRawData.findUnique({
      where: { id },
    })
  );

  if (error) throw new DatabaseError("Failed to fetch raw data record", { error: error.message });
  if (!record) throw new NotFoundError("Raw data record");
  if (config.logging.db) serviceLogger.debug({ id }, "Fetched raw data record");

  return record;
}

// Fetches a paginated list of raw data records with total count
export async function getRawDataList(input: RawDataListInput = {}) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.max(1, input.limit ?? 20);
  const skip = (page - 1) * limit;

  const prisma = DatabaseClient.getInstance();

  const [error, result] = await tryCatch(
    prisma.$transaction([
      prisma.whatsAppChatSupportRawData.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.whatsAppChatSupportRawData.count(),
    ])
  );

  if (error) throw new DatabaseError("Failed to fetch raw data list", { error: error.message });
  if (!result) throw new DatabaseError("Failed to fetch raw data list", { error: "Empty transaction result" });
  if (config.logging.db) serviceLogger.debug({ page, limit, total: result[1] }, "Fetched raw data list");

  const [items, total] = result;

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Updates an existing raw data record after validation
export async function updateRawData(id: number, data: UpdateRawDataInput) {
  const payload = updateRawDataSchema.parse(data);
  const prisma = DatabaseClient.getInstance();
  const normalizedPayload = normalizeRawDataPayload(payload);

  // Verify record exists before attempting update
  const [existingError, existingRecord] = await tryCatch(
    prisma.whatsAppChatSupportRawData.findUnique({
      where: { id },
    })
  );

  if (existingError) {
    throw new DatabaseError("Failed to fetch raw data record for update", {
      error: existingError.message,
    });
  }

  if (!existingRecord) throw new NotFoundError("Raw data record");

  const [error, updated] = await tryCatch(
    prisma.whatsAppChatSupportRawData.update({ where: { id }, data: normalizedPayload })
  );

  if (error) throw new DatabaseError("Failed to update raw data record", { error: error.message });
  if (config.logging.db) serviceLogger.info({ id }, "Updated raw data record");

  return updated;
}

// Deletes a single raw data record by ID
export async function deleteRawData(id: number) {
  const prisma = DatabaseClient.getInstance();

  // Verify record exists before attempting delete
  const [existingError, existingRecord] = await tryCatch(
    prisma.whatsAppChatSupportRawData.findUnique({ where: { id } })
  );

  if (existingError) {
    throw new DatabaseError("Failed to fetch raw data record for delete", {
      error: existingError.message,
    });
  }

  if (!existingRecord) throw new NotFoundError("Raw data record");

  const [error, deleted] = await tryCatch(
    prisma.whatsAppChatSupportRawData.delete({
      where: { id },
    })
  );

  if (error) throw new DatabaseError("Failed to delete raw data record", { error: error.message });
  if (config.logging.db) serviceLogger.info({ id }, "Deleted raw data record");

  return deleted;
}

// Bulk deletes multiple raw data records by IDs
export async function deleteRawDataItems(ids: number[]) {
  const prisma = DatabaseClient.getInstance();

  // Delete all records matching the provided IDs
  const [error, deleted] = await tryCatch(
    prisma.whatsAppChatSupportRawData.deleteMany({
      where: { id: { in: ids, } },
    })
  );

  if (error) throw new DatabaseError("Failed to bulk delete raw data records", { error: error.message });
  if (config.logging.db && deleted) serviceLogger.info({ count: deleted.count }, "Bulk deleted raw data records");

  return deleted;
}

function normalizeRawDataPayload<T extends { rawData?: unknown; createdDatetime?: Date; created?: Date }>(
  payload: T
) {
  const { rawData, ...rest } = payload;

  if (rawData === undefined) return rest;

  return {
    ...rest,
    rawData: rawData === null ? Prisma.JsonNull : rawData,
  };
}
