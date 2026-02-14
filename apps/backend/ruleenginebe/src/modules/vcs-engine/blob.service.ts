import crypto from "node:crypto";
import { prisma } from "../../databases/client.js";

/** Stable JSON stringify for hashing (object keys sorted). */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  return JSON.stringify(value, Object.keys(value).sort());
}

/** Compute SHA-256 content hash for JSON content. */
export function computeContentHash(content: unknown): string {
  const str = typeof content === "string" ? content : stableStringify(content);
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

export type BlobWithContent = {
  id: string;
  repositoryId: string;
  contentHash: string;
  content: unknown;
  createdAt: Date;
};

export class BlobService {
  async create(repositoryId: string, content: unknown): Promise<BlobWithContent> {
    const contentHash = computeContentHash(content);
    const normalized = typeof content === "string" ? (JSON.parse(content) as object) : content;
    const blob = await prisma.blob.upsert({
      where: {
        repositoryId_contentHash: { repositoryId, contentHash },
      },
      create: {
        repositoryId,
        contentHash,
        content: (normalized ?? content) as object,
      },
      update: {},
    });
    return {
      id: blob.id,
      repositoryId: blob.repositoryId,
      contentHash: blob.contentHash,
      content: blob.content as unknown,
      createdAt: blob.createdAt,
    };
  }

  async findById(id: string): Promise<BlobWithContent | null> {
    const blob = await prisma.blob.findUnique({
      where: { id },
    });
    if (!blob) return null;
    return {
      id: blob.id,
      repositoryId: blob.repositoryId,
      contentHash: blob.contentHash,
      content: blob.content as unknown,
      createdAt: blob.createdAt,
    };
  }

  async findByRepositoryAndHash(
    repositoryId: string,
    contentHash: string
  ): Promise<BlobWithContent | null> {
    const blob = await prisma.blob.findUnique({
      where: { repositoryId_contentHash: { repositoryId, contentHash } },
    });
    if (!blob) return null;
    return {
      id: blob.id,
      repositoryId: blob.repositoryId,
      contentHash: blob.contentHash,
      content: blob.content as unknown,
      createdAt: blob.createdAt,
    };
  }

  async listByRepository(
    repositoryId: string,
    skip = 0,
    take = 50
  ): Promise<BlobWithContent[]> {
    const blobs = await prisma.blob.findMany({
      where: { repositoryId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return blobs.map((b) => ({
      id: b.id,
      repositoryId: b.repositoryId,
      contentHash: b.contentHash,
      content: b.content as unknown,
      createdAt: b.createdAt,
    }));
  }
}
