import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as runtimeUtils from "@prisma/client-runtime-utils";
import { PrismaClient } from "./generated/prisma";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });

// Temporary compatibility shim for mixed Prisma runtime-utils versions.
const runtimeUtilsMutable = runtimeUtils as unknown as Record<string, unknown>;
if (typeof runtimeUtilsMutable.isObjectEnumValue !== "function") {
  runtimeUtilsMutable.isObjectEnumValue = (
    value: unknown
  ): boolean => {
    return (
      typeof value === "object" &&
      value !== null &&
      typeof (value as { _getName?: unknown })._getName === "function"
    );
  };
}

export const prisma = new PrismaClient({ adapter });
