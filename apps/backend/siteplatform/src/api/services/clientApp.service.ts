import { ClientApp } from "../../generated/prisma";
import { prisma } from "../../databases/client";
import { generateSecret } from "../../utils/generateSecret.util";

// Types
type ServiceData = {
    id: string;
    name: string;
    baseUrl: string;
    createdAt: Date;
};

type RouteData = {
    id: string;
    exposedPath: string;
    actualPath: string;
    method: string;
    service?: ServiceData;
};

type PermissionData = {
    id: string;
    route?: RouteData;
};

type ClientAppWithPermissions = {
    id: string;
    name: string;
    secret: string;
    createdAt: Date;
    permissions?: Array<{
        id: string;
        path: string;
        internalPath: string;
        method?: string;
        route?: RouteData;
        service?: ServiceData;
    }>;
};

// Helper Functions
function mapPermissionsForGateway(permissions: PermissionData[]): ClientAppWithPermissions["permissions"] {
    return (permissions || []).map((perm) => ({
        id: perm.id,
        path: perm.route?.exposedPath || "",
        internalPath: perm.route?.actualPath || "",
        method: perm.route?.method,
        route: perm.route,
        service: perm.route?.service,
    }));
}

// Service
export class ClientAppService {
    private static instance: ClientAppService;

    static getInstance(): ClientAppService {
        if (!ClientAppService.instance) {
            ClientAppService.instance = new ClientAppService();
        }
        return ClientAppService.instance;
    }

    // Read Operations
    async getClientAppById(id: string): Promise<ClientApp | null> {
        return prisma.clientApp.findUnique({
            where: { id },
        });
    }

    async getClientAppByIdWithRoutePermissions(id: string): Promise<ClientAppWithPermissions | null> {
        const app = await prisma.clientApp.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        route: {
                            include: {
                                service: true,
                            },
                        },
                    },
                },
            },
        });

        if (!app) return null;

        return {
            ...app,
            permissions: mapPermissionsForGateway(app.permissions),
        };
    }

    async getAllClientApps(): Promise<ClientApp[]> {
        return prisma.clientApp.findMany();
    }

    // Create Operations
    async createClientApp(data: Omit<ClientApp, "id" | "secret">): Promise<ClientApp> {
        return prisma.clientApp.create({
            data: { ...data, secret: generateSecret() },
        });
    }

    async createBulkClientApps(apps: Omit<ClientApp, "id">[]): Promise<{ count: number }> {
        return prisma.clientApp.createMany({
            data: apps,
        });
    }

    // Update Operations
    async updateClientApp(data: Partial<Omit<ClientApp, "id">> & { id: string }): Promise<ClientApp> {
        return prisma.clientApp.update({
            where: { id: data.id },
            data,
        });
    }

    async updateBulkClientApps(apps: (Partial<Omit<ClientApp, "id">> & { id: string })[]): Promise<{ count: number }> {
        const promises = apps.map((app) => this.updateClientApp(app));
        await Promise.all(promises);
        return { count: apps.length };
    }

    // Delete Operations
    async deleteClientApp(id: string): Promise<ClientApp> {
        return prisma.clientApp.delete({
            where: { id },
        });
    }

    async deleteBulkClientApps(apps: { id: string }[]): Promise<{ count: number }> {
        const promises = apps.map((app) => this.deleteClientApp(app.id));
        await Promise.all(promises);
        return { count: apps.length };
    }
}