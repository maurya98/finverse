import type { Prisma } from "@prisma/client";
import { prisma } from "../../databases/client";

// Custom input type that accepts serviceId directly
type ServiceRouteCreateInputSimple = {
    serviceId: string;
    name: string;
    method: string;
    actualPath: string;
    exposedPath: string;
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
};

type ServiceRouteCreateManyInputSimple = ServiceRouteCreateInputSimple[];

// Service
export class RouteService {
    private static instance: RouteService;

    static getInstance(): RouteService {
        if (!RouteService.instance) {
            RouteService.instance = new RouteService();
        }
        return RouteService.instance;
    }

    // Read Operations
    async getRouteById(id: string): Promise<Prisma.ServiceRouteGetPayload<true> | null> {
        return prisma.serviceRoute.findUnique({
            where: {
                id,
            },
        });
    }

    async getAllRoutes(): Promise<Prisma.ServiceRouteGetPayload<true>[]> {
        return prisma.serviceRoute.findMany();
    }

    // Create Operations
    async createRoute(data: ServiceRouteCreateInputSimple): Promise<Prisma.ServiceRouteGetPayload<true>> {
        return prisma.serviceRoute.create({
            data: {
                name: data.name,
                method: data.method as unknown as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
                actualPath: data.actualPath,
                exposedPath: data.exposedPath,
                description: data.description,
                isActive: data.isActive,
                createdAt: data.createdAt,
                service: { connect: { id: data.serviceId } },
            },
        });
    }

    async createBulkRoutes(routes: ServiceRouteCreateManyInputSimple): Promise<{ count: number }> {
        const promises = routes.map((r) =>
            prisma.serviceRoute.create({
                data: {
                    name: r.name,
                    method: r.method as unknown as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
                    actualPath: r.actualPath,
                    exposedPath: r.exposedPath,
                    description: r.description,
                    isActive: r.isActive,
                    createdAt: r.createdAt,
                    service: { connect: { id: r.serviceId } },
                },
            })
        );
        await Promise.all(promises);
        return { count: routes.length };
    }

    // Update Operations - handles both create (no ID) and upsert (with ID)
    async updateRoute(data: Partial<Omit<Prisma.ServiceRouteUpdateInput, "id">> & { id?: string; serviceId?: string }): Promise<Prisma.ServiceRouteGetPayload<true>> {
        const { id, serviceId, ...updateData } = data;
        // If no ID provided, create new record with generated ID
        if (!id) {
            return prisma.serviceRoute.create({
                data: {
                    name: data.name as string,
                    method: data.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
                    actualPath: data.actualPath as string,
                    exposedPath: data.exposedPath as string,
                    serviceId: serviceId as string,
                    description: data.description as string | undefined,
                    isActive: data.isActive as boolean | undefined,
                },
            });
        }
        // If ID provided, upsert (create if not exists, update if exists)
        return prisma.serviceRoute.upsert({
            where: {
                id,
            },
            update: updateData,
            create: {
                id,
                name: data.name as string,
                method: data.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
                actualPath: data.actualPath as string,
                exposedPath: data.exposedPath as string,
                serviceId: serviceId as string,
                description: data.description as string | undefined,
                isActive: data.isActive as boolean | undefined,
            },
        });
    }

    async updateBulkRoutes(routes: (Partial<Omit<Prisma.ServiceRouteUpdateInput, "id">> & { id?: string; serviceId?: string })[]): Promise<{ count: number }> {
        const promises = routes.map((route) => this.updateRoute(route));
        await Promise.all(promises);
        return { count: routes.length };
    }

    // Delete Operations
    async deleteRoute(id: string): Promise<Prisma.ServiceRouteGetPayload<true>> {
        return prisma.serviceRoute.delete({
            where: {
                id,
            },
        });
    }

    async deleteBulkRoutes(routes: { id: string }[]): Promise<{ count: number }> {
        const promises = routes.map((route) => this.deleteRoute(route.id));
        await Promise.all(promises);
        return { count: routes.length };
    }
}