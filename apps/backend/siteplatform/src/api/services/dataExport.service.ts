import { prisma } from "../../databases/client";
import {
  CACHE_KEYS,
  CACHE_TTL,
  getOrFetchItem,
  getOrFetchMultiple,
  invalidateCacheByPattern,
} from "../../utils/cacheHelper.util";

interface ExportedData {
    services: Array<{
        id: string;
        name: string;
        baseUrl: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        routes: Array<{
            id: string;
            name: string;
            description: string;
            isActive: boolean;
            method: string;
            actualPath: string;
            exposedPath: string;
            createdAt: Date;
        }>;
    }>;
    clientApps: Array<{
        id: string;
        name: string;
        description: string;
        isActive: boolean;
        secret: string;
        createdAt: Date;
        permissions: Array<{
            id: string;
            description: string;
            isActive: boolean;
            scope: string;
            route: {
                id: string;
                name: string;
                method: string;
                actualPath: string;
                exposedPath: string;
            };
        }>;
    }>;
    metadata: {
        exportedAt: Date;
        version: string;
    };
}

export class DataExportService {
    private static instance: DataExportService;

    static getInstance(): DataExportService {
        if (!DataExportService.instance) {
            DataExportService.instance = new DataExportService();
        }
        return DataExportService.instance;
    }

    /**
     * Export all data including services with their routes and client apps with their permissions
     * Relationships are automatically resolved by Prisma includes
     */
    async exportAllData(): Promise<ExportedData> {
        const cacheKey = "dataExport:all";
        return getOrFetchItem(
            cacheKey,
            async () => {
                try {
                    // Fetch services with their routes
                    const services = await prisma.service.findMany({
                        include: {
                            routes: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    isActive: true,
                                    method: true,
                                    actualPath: true,
                                    exposedPath: true,
                                    createdAt: true,
                                },
                            },
                        },
                    });

                    // Fetch client apps with their permissions and related routes
                    const clientApps = await prisma.clientApp.findMany({
                        include: {
                            permissions: {
                                select: {
                                    id: true,
                                    description: true,
                                    isActive: true,
                                    scope: true,
                                    route: {
                                        select: {
                                            id: true,
                                            name: true,
                                            method: true,
                                            actualPath: true,
                                            exposedPath: true,
                                        },
                                    },
                                },
                            },
                        },
                    });

                    return {
                        services: services.map((service) => ({
                            id: service.id,
                            name: service.name,
                            baseUrl: service.baseUrl,
                            description: service.description,
                            isActive: service.isActive,
                            createdAt: service.createdAt,
                            routes: service.routes,
                        })),
                        clientApps: clientApps.map((app) => ({
                            id: app.id,
                            name: app.name,
                            description: app.description,
                            isActive: app.isActive,
                            secret: app.secret,
                            createdAt: app.createdAt,
                            permissions: app.permissions,
                        })),
                        metadata: {
                            exportedAt: new Date(),
                            version: "1.0",
                        },
                    };
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || String(error);
                    throw new Error(`Failed to export data: ${errorMessage}`);
                }
            },
            CACHE_TTL.LONG
        ) as Promise<ExportedData>;
    }

    /**
     * Export only services with their routes
     */
    async exportServices() {
        const cacheKey = "dataExport:services";
        return getOrFetchMultiple(
            cacheKey,
            async () => {
                try {
                    return await prisma.service.findMany({
                        include: {
                            routes: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    isActive: true,
                                    method: true,
                                    actualPath: true,
                                    exposedPath: true,
                                    createdAt: true,
                                },
                            },
                        },
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || String(error);
                    throw new Error(`Failed to export services: ${errorMessage}`);
                }
            },
            CACHE_TTL.LONG
        );
    }

    /**
     * Export only client apps with their permissions
     */
    async exportClientApps() {
        const cacheKey = "dataExport:clientApps";
        return getOrFetchMultiple(
            cacheKey,
            async () => {
                try {
                    return await prisma.clientApp.findMany({
                        include: {
                            permissions: {
                                select: {
                                    id: true,
                                    description: true,
                                    isActive: true,
                                    scope: true,
                                    route: {
                                        select: {
                                            id: true,
                                            name: true,
                                            method: true,
                                            actualPath: true,
                                            exposedPath: true,
                                        },
                                    },
                                },
                            },
                        },
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || String(error);
                    throw new Error(`Failed to export client apps: ${errorMessage}`);
                }
            },
            CACHE_TTL.LONG
        );
    }

    /**
     * Export client app route permissions for authorization checking
     */
    async exportClientAppRoutePermissions() {
        const cacheKey = "dataExport:permissions";
        return getOrFetchMultiple(
            cacheKey,
            async () => {
                try {
                    return await prisma.clientPermission.findMany({
                        include: {
                            client: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            route: {
                                select: {
                                    id: true,
                                    method: true,
                                    exposedPath: true,
                                    actualPath: true,
                                },
                            },
                        },
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || String(error);
                    throw new Error(`Failed to export permissions: ${errorMessage}`);
                }
            },
            CACHE_TTL.LONG
        );
    }

    /**
     * Import all data (services, routes, client apps, permissions)
     * Handles foreign key relationships automatically - safe to import without worrying about IDs
     */
    async importAllData(data: ExportedData): Promise<{ success: boolean; summary: Record<string, unknown> }> {
        try {
            let servicesCreated = 0;
            let routesCreated = 0;
            let appsCreated = 0;
            let permissionsCreated = 0;

            // Import services first (they have no foreign keys)
            for (const service of data.services) {
                await prisma.service.upsert({
                    where: { name: service.name },
                    update: {
                        baseUrl: service.baseUrl,
                        description: service.description,
                        isActive: service.isActive,
                    },
                    create: {
                        id: service.id,
                        name: service.name,
                        baseUrl: service.baseUrl,
                        description: service.description,
                        isActive: service.isActive,
                        createdAt: service.createdAt,
                    },
                });
                servicesCreated++;

                // Import routes for each service
                for (const route of service.routes) {
                    await prisma.serviceRoute.upsert({
                        where: {
                            method_exposedPath: {
                                method: route.method as never,
                                exposedPath: route.exposedPath,
                            },
                        },
                        update: {
                            name: route.name,
                            description: route.description,
                            isActive: route.isActive,
                            actualPath: route.actualPath,
                        },
                        create: {
                            id: route.id,
                            serviceId: service.id,
                            name: route.name,
                            description: route.description,
                            isActive: route.isActive,
                            method: route.method as never,
                            actualPath: route.actualPath,
                            exposedPath: route.exposedPath,
                            createdAt: route.createdAt,
                        },
                    });
                    routesCreated++;
                }
            }

            // Import client apps
            for (const app of data.clientApps) {
                await prisma.clientApp.upsert({
                    where: { name: app.name },
                    update: {
                        description: app.description,
                        isActive: app.isActive,
                        secret: app.secret,
                    },
                    create: {
                        id: app.id,
                        name: app.name,
                        description: app.description,
                        isActive: app.isActive,
                        secret: app.secret,
                        createdAt: app.createdAt,
                    },
                });
                appsCreated++;

                // Import permissions for each app
                for (const permission of app.permissions) {
                    // Find the route by its exposed path and method
                    const route = await prisma.serviceRoute.findFirst({
                        where: {
                            exposedPath: permission.route.exposedPath,
                            method: permission.route.method as never,
                        },
                    });

                    if (route) {
                        await prisma.clientPermission.upsert({
                            where: {
                                clientId_routeId: {
                                    clientId: app.id,
                                    routeId: route.id,
                                },
                            },
                            update: {
                                description: permission.description,
                                isActive: permission.isActive,
                                scope: permission.scope as never,
                            },
                            create: {
                                id: permission.id,
                                clientId: app.id,
                                routeId: route.id,
                                description: permission.description,
                                isActive: permission.isActive,
                                scope: permission.scope as never,
                            },
                        });
                        permissionsCreated++;
                    }
                }
            }

            return {
                success: true,
                summary: {
                    servicesCreated,
                    routesCreated,
                    appsCreated,
                    permissionsCreated,
                    totalEntities: servicesCreated + routesCreated + appsCreated + permissionsCreated,
                },
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || String(error);
            throw new Error(`Failed to import data: ${errorMessage}`);
        } finally {
            // Invalidate all related caches after import
            await invalidateCacheByPattern("dataExport:*");
            await invalidateCacheByPattern(`${CACHE_KEYS.INTERNAL_SERVICE}:*`);
            await invalidateCacheByPattern(`${CACHE_KEYS.ROUTE}:*`);
            await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:*`);
            await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_PERMISSION}:*`);
        }
    }

    /**
     * Import only services with their routes
     */
    async importServices(services: ExportedData["services"]): Promise<{ success: boolean; summary: Record<string, unknown> }> {
        try {
            let servicesCreated = 0;
            let routesCreated = 0;

            for (const service of services) {
                await prisma.service.upsert({
                    where: { name: service.name },
                    update: {
                        baseUrl: service.baseUrl,
                        description: service.description,
                        isActive: service.isActive,
                    },
                    create: {
                        id: service.id,
                        name: service.name,
                        baseUrl: service.baseUrl,
                        description: service.description,
                        isActive: service.isActive,
                        createdAt: service.createdAt,
                    },
                });
                servicesCreated++;

                for (const route of service.routes) {
                    await prisma.serviceRoute.upsert({
                        where: {
                            method_exposedPath: {
                                method: route.method as never,
                                exposedPath: route.exposedPath,
                            },
                        },
                        update: {
                            name: route.name,
                            description: route.description,
                            isActive: route.isActive,
                            actualPath: route.actualPath,
                        },
                        create: {
                            id: route.id,
                            serviceId: service.id,
                            name: route.name,
                            description: route.description,
                            isActive: route.isActive,
                            method: route.method as never,
                            actualPath: route.actualPath,
                            exposedPath: route.exposedPath,
                            createdAt: route.createdAt,
                        },
                    });
                    routesCreated++;
                }
            }

            return {
                success: true,
                summary: {
                    servicesCreated,
                    routesCreated,
                    totalEntities: servicesCreated + routesCreated,
                },
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || String(error);
            throw new Error(`Failed to import services: ${errorMessage}`);
        } finally {
            // Invalidate related caches
            await invalidateCacheByPattern("dataExport:*");
            await invalidateCacheByPattern(`${CACHE_KEYS.INTERNAL_SERVICE}:*`);
            await invalidateCacheByPattern(`${CACHE_KEYS.ROUTE}:*`);
            await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:with_permissions:*`);
        }
    }

    /**
     * Import only client apps with their permissions
     */
    async importClientApps(apps: ExportedData["clientApps"]): Promise<{ success: boolean; summary: Record<string, unknown> }> {
        try {
            let appsCreated = 0;
            let permissionsCreated = 0;

            for (const app of apps) {
                await prisma.clientApp.upsert({
                    where: { name: app.name },
                    update: {
                        description: app.description,
                        isActive: app.isActive,
                        secret: app.secret,
                    },
                    create: {
                        id: app.id,
                        name: app.name,
                        description: app.description,
                        isActive: app.isActive,
                        secret: app.secret,
                        createdAt: app.createdAt,
                    },
                });
                appsCreated++;

                for (const permission of app.permissions) {
                    // Find the route by its exposed path and method
                    const route = await prisma.serviceRoute.findFirst({
                        where: {
                            exposedPath: permission.route.exposedPath,
                            method: permission.route.method as never,
                        },
                    });

                    if (route) {
                        await prisma.clientPermission.upsert({
                            where: {
                                clientId_routeId: {
                                    clientId: app.id,
                                    routeId: route.id,
                                },
                            },
                            update: {
                                description: permission.description,
                                isActive: permission.isActive,
                                scope: permission.scope as never,
                            },
                            create: {
                                id: permission.id,
                                clientId: app.id,
                                routeId: route.id,
                                description: permission.description,
                                isActive: permission.isActive,
                                scope: permission.scope as never,
                            },
                        });
                        permissionsCreated++;
                    }
                }
            }

            return {
                success: true,
                summary: {
                    appsCreated,
                    permissionsCreated,
                    totalEntities: appsCreated + permissionsCreated,
                },
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : (error as Record<string, unknown>)?.message || String(error);
            throw new Error(`Failed to import client apps: ${errorMessage}`);
        } finally {
            // Invalidate related caches
            await invalidateCacheByPattern("dataExport:*");
            await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_APP}:*`);
            await invalidateCacheByPattern(`${CACHE_KEYS.CLIENT_PERMISSION}:*`);
        }
    }
}
