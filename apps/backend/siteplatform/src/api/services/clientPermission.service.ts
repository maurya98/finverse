import type { Prisma } from "@prisma/client";
import { prisma } from "../../databases/client";
import {
  CACHE_KEYS,
  CACHE_TTL,
  generateAllItemsCacheKey,
  generateItemCacheKey,
  getOrFetchItem,
  getOrFetchMultiple,
  invalidateCache,
  invalidateCacheByPattern,
} from "../../utils/cacheHelper.util";

// Custom input types that accept IDs directly
type ClientPermissionCreateInputSimple = {
    clientId: string;
    routeId: string;
    scope?: string;
    description?: string;
    isActive?: boolean;
};

type ClientPermissionCreateManyInputSimple = ClientPermissionCreateInputSimple[];

// Service
export class ClientPermissionService {
    private static instance: ClientPermissionService;

    static getInstance(): ClientPermissionService {
        if (!ClientPermissionService.instance) {
            ClientPermissionService.instance = new ClientPermissionService();
        }
        return ClientPermissionService.instance;
    }

    // Read Operations
    async getClientPermissionById(id: string): Promise<Prisma.ClientPermissionGetPayload<true> | null> {
        const cacheKey = generateItemCacheKey(CACHE_KEYS.CLIENT_PERMISSION, id);
        return getOrFetchItem(
            cacheKey,
            () => prisma.clientPermission.findUnique({ where: { id } }),
            CACHE_TTL.LONG
        );
    }

    async getAllClientPermissions(): Promise<Prisma.ClientPermissionGetPayload<true>[]> {
        const cacheKey = generateAllItemsCacheKey(CACHE_KEYS.CLIENT_PERMISSION);
        return getOrFetchMultiple(
            cacheKey,
            () => prisma.clientPermission.findMany(),
            CACHE_TTL.LONG
        );
    }

    // Create Operations
    async createClientPermission(data: ClientPermissionCreateInputSimple): Promise<Prisma.ClientPermissionGetPayload<true>> {
        const normalizedScope = (data.scope?.toUpperCase() as "READ" | "WRITE" | "FULL") || "FULL";
        const result = await prisma.clientPermission.create({
            data: {
                description: data.description,
                isActive: data.isActive,
                scope: normalizedScope,
                client: { connect: { id: data.clientId } },
                route: { connect: { id: data.routeId } },
            },
        });
        
        // Invalidate permissions cache and client app permissions cache
        await invalidateCache([generateAllItemsCacheKey(CACHE_KEYS.CLIENT_PERMISSION)]);
        await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:with_permissions:*`);
        
        return result;
    }

    async createBulkClientPermissions(permissions: ClientPermissionCreateManyInputSimple): Promise<{ count: number }> {
        const promises = permissions.map((p) => {
            const normalizedScope = (p.scope?.toUpperCase() as "READ" | "WRITE" | "FULL") || "FULL";
            return prisma.clientPermission.create({
                data: {
                    description: p.description,
                    isActive: p.isActive,
                    scope: normalizedScope,
                    client: { connect: { id: p.clientId } },
                    route: { connect: { id: p.routeId } },
                },
            });
        });
        await Promise.all(promises);
        
        // Invalidate permissions cache and client app permissions cache
        await invalidateCache([generateAllItemsCacheKey(CACHE_KEYS.CLIENT_PERMISSION)]);
        await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:with_permissions:*`);
        
        return { count: permissions.length };
    }

    // Update Operations - handles both create (no ID) and upsert (with ID)
    async updateClientPermission(data: Partial<Omit<Prisma.ClientPermissionUpdateInput, "id">> & { id?: string; clientId?: string; routeId?: string }): Promise<Prisma.ClientPermissionGetPayload<true>> {
        const { id, clientId, routeId, ...updateData } = data;
        // Normalize scope if provided
        if (updateData.scope) {
            updateData.scope = (updateData.scope as string).toUpperCase() as "READ" | "WRITE" | "FULL";
        }
        
        let result: Prisma.ClientPermissionGetPayload<true>;
        
        // If no ID provided, create new record with generated ID
        if (!id) {
            const normalizedScope = (updateData.scope as "READ" | "WRITE" | "FULL") || "FULL";
            result = await prisma.clientPermission.create({
                data: {
                    clientId: clientId as string,
                    routeId: routeId as string,
                    scope: normalizedScope,
                    description: data.description as string | undefined,
                    isActive: data.isActive as boolean | undefined,
                },
            });
        } else {
            // If ID provided, upsert (create if not exists, update if exists)
            result = await prisma.clientPermission.upsert({
                where: { id },
                update: updateData,
                create: {
                    id,
                    clientId: clientId as string,
                    routeId: routeId as string,
                    scope: (updateData.scope as "READ" | "WRITE" | "FULL") || "FULL",
                    description: data.description as string | undefined,
                    isActive: data.isActive as boolean | undefined,
                },
            });
        }
        
        // Invalidate cache
        if (id) {
            await invalidateCache([generateItemCacheKey(CACHE_KEYS.CLIENT_PERMISSION, id)]);
        }
        await invalidateCache([generateAllItemsCacheKey(CACHE_KEYS.CLIENT_PERMISSION)]);
        await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:with_permissions:*`);
        
        return result;
    }

    async updateBulkClientPermissions(permissions: (Partial<Omit<Prisma.ClientPermissionUpdateInput, "id">> & { id?: string })[]): Promise<{ count: number }> {
        const promises = permissions.map((permission) => this.updateClientPermission(permission));
        await Promise.all(promises);
        return { count: permissions.length };
    }

    // Delete Operations
    async deleteClientPermission(id: string): Promise<Prisma.ClientPermissionGetPayload<true>> {
        const result = await prisma.clientPermission.delete({
            where: { id },
        });
        
        // Invalidate cache
        await invalidateCache([
            generateItemCacheKey(CACHE_KEYS.CLIENT_PERMISSION, id),
            generateAllItemsCacheKey(CACHE_KEYS.CLIENT_PERMISSION),
        ]);
        await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:with_permissions:*`);
        
        return result;
    }

    async deleteBulkClientPermissions(permissions: { id: string }[]): Promise<{ count: number }> {
        const promises = permissions.map((permission) => this.deleteClientPermission(permission.id));
        await Promise.all(promises);
        return { count: permissions.length };
    }
}