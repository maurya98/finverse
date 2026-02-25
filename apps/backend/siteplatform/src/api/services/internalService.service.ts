import { Service } from "@prisma/client";
import { prisma } from "../../databases/client";

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
    async getInternalServiceById(id: string): Promise<Service | null> {
        return prisma.service.findUnique({
            where: {
                id,
            },
        });
    }

    async getAllInternalServices(): Promise<Service[]> {
        return prisma.service.findMany();
    }

    // Create Operations
    async createInternalService(data: Omit<Service, "id">): Promise<Service> {
        return prisma.service.create({
            data
        });
    }

    async createBulkInternalServices(services: Omit<Service, "id">[]): Promise<{ count: number }> {
        return prisma.service.createMany({
            data: services,
        });
    }

    // Update Operations
    async updateInternalService(data: Partial<Omit<Service, "id">> & { id: string }): Promise<Service> {
        return prisma.service.update({
            where: {
                id: data.id,
            },
            data,
        });
    }

    async updateBulkInternalServices(services: (Partial<Omit<Service, "id">> & { id: string })[]): Promise<{ count: number }> {
        const promises = services.map((service) => this.updateInternalService(service));
        await Promise.all(promises);
        return { count: services.length };
    }
    
    // Delete Operations
    async deleteInternalService(id: string): Promise<Service> {
        return prisma.service.delete({
            where: {
                id,
            },
        });
    }

    async deleteBulkInternalServices(services: { id: string }[]): Promise<{ count: number }> {
        const promises = services.map((service) => this.deleteInternalService(service.id));
        await Promise.all(promises);
        return { count: services.length };
    }
}