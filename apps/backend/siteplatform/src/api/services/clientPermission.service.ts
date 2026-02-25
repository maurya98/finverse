import { ClientPermission } from "@prisma/client";
import { prisma } from "../../databases/client";

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
    async getClientPermissionById(id: string): Promise<ClientPermission | null> {
        return prisma.clientPermission.findUnique({
            where: {
                id,
            },
        });
    }

    async getAllClientPermissions(): Promise<ClientPermission[]> {
        return prisma.clientPermission.findMany();
    }

    // Create Operations
    async createClientPermission(data: Omit<ClientPermission, "id">): Promise<ClientPermission> {
        return prisma.clientPermission.create({
            data
        });
    }

    async createBulkClientPermissions(permissions: Omit<ClientPermission, "id">[]): Promise<{ count: number }> {
        return prisma.clientPermission.createMany({
            data: permissions,
        });
    }

    // Update Operations
    async updateClientPermission(data: Partial<Omit<ClientPermission, "id">> & { id: string }): Promise<ClientPermission> {
        return prisma.clientPermission.update({
            where: {
                id: data.id,
            },
            data,
        });
    }

    async updateBulkClientPermissions(permissions: (Partial<Omit<ClientPermission, "id">> & { id: string })[]): Promise<{ count: number }> {
        const promises = permissions.map((permission) => this.updateClientPermission(permission));
        await Promise.all(promises);
        return { count: permissions.length };
    }

    // Delete Operations
    async deleteClientPermission(id: string): Promise<ClientPermission> {
        return prisma.clientPermission.delete({
            where: {
                id,
            },
        });
    }

    async deleteBulkClientPermissions(permissions: { id: string }[]): Promise<{ count: number }> {
        const promises = permissions.map((permission) => this.deleteClientPermission(permission.id));
        await Promise.all(promises);
        return { count: permissions.length };
    }
}