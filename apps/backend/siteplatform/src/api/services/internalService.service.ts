import type { Prisma } from "../../databases/generated/prisma";
import { prisma } from "../../databases/client";
import {
  CACHE_KEYS,
  CACHE_TTL,
  generateAllItemsCacheKey,
  generateItemCacheKey,
  getOrFetchItem,
  getOrFetchMultiple,
  invalidateCache,
} from "../../utils/cacheHelper.util";

// Service
export class InternalServiceService {
    private static instance: InternalServiceService;

    static getInstance(): InternalServiceService {
        if (!InternalServiceService.instance) {
            InternalServiceService.instance = new InternalServiceService();
        }
        return InternalServiceService.instance;
    }

    // Read Operations
    async getInternalServiceById(id: string): Promise<Prisma.ServiceGetPayload<true> | null> {
        const cacheKey = generateItemCacheKey(CACHE_KEYS.INTERNAL_SERVICE, id);
        return getOrFetchItem(
            cacheKey,
            () => prisma.service.findUnique({ where: { id } }),
            CACHE_TTL.LONG
        );
    }

    async getAllInternalServices(): Promise<Prisma.ServiceGetPayload<true>[]> {
        const cacheKey = generateAllItemsCacheKey(CACHE_KEYS.INTERNAL_SERVICE);
        return getOrFetchMultiple(
            cacheKey,
            () => prisma.service.findMany(),
            CACHE_TTL.LONG
        );
    }

    // Create Operations
    async createInternalService(data: Omit<Prisma.ServiceCreateInput, "id">): Promise<Prisma.ServiceGetPayload<true>> {
        const result = await prisma.service.create({ data });
        
        // Invalidate cache for all services
        await invalidateCache([generateAllItemsCacheKey(CACHE_KEYS.INTERNAL_SERVICE)]);
        
        return result;
    }

    async createBulkInternalServices(services: Omit<Prisma.ServiceCreateInput, "id">[]): Promise<{ count: number }> {
        const result = await prisma.service.createMany({ data: services });
        
        // Invalidate cache for all services
        await invalidateCache([generateAllItemsCacheKey(CACHE_KEYS.INTERNAL_SERVICE)]);
        
        return result;
    }

    // Update Operations
    async updateInternalService(data: Partial<Omit<Prisma.ServiceUpdateInput, "id">> & { id: string }): Promise<Prisma.ServiceGetPayload<true>> {
        const { id, ...updateData } = data;
        const result = await prisma.service.update({
            where: { id },
            data: updateData,
        });
        
        // Invalidate cache for this specific service and all services list
        await invalidateCache([
            generateItemCacheKey(CACHE_KEYS.INTERNAL_SERVICE, id),
            generateAllItemsCacheKey(CACHE_KEYS.INTERNAL_SERVICE),
        ]);
        
        return result;
    }

    async updateBulkInternalServices(services: (Partial<Omit<Prisma.ServiceUpdateInput, "id">> & { id: string })[]): Promise<{ count: number }> {
        const promises = services.map((service) => this.updateInternalService(service));
        await Promise.all(promises);
        return { count: services.length };
    }
    
    // Delete Operations
    async deleteInternalService(id: string): Promise<Prisma.ServiceGetPayload<true>> {
        const result = await prisma.service.delete({
            where: { id },
        });
        
        // Invalidate cache for this specific service and all services list
        await invalidateCache([
            generateItemCacheKey(CACHE_KEYS.INTERNAL_SERVICE, id),
            generateAllItemsCacheKey(CACHE_KEYS.INTERNAL_SERVICE),
        ]);
        
        return result;
    }

    async deleteBulkInternalServices(services: { id: string }[]): Promise<{ count: number }> {
        const promises = services.map((service) => this.deleteInternalService(service.id));
        await Promise.all(promises);
        return { count: services.length };
    }
}