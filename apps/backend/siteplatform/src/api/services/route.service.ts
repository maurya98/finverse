import { ServiceRoute } from "@prisma/client";
import { prisma } from "../../databases/client";

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
    async getRouteById(id: string): Promise<ServiceRoute | null> {
        return prisma.serviceRoute.findUnique({
            where: {
                id,
            },
        });
    }

    async getAllRoutes(): Promise<ServiceRoute[]> {
        return prisma.serviceRoute.findMany();
    }

    // Create Operations
    async createRoute(data: Omit<ServiceRoute, "id">): Promise<ServiceRoute> {
        return prisma.serviceRoute.create({
            data
        });
    }

    async createBulkRoutes(routes: Omit<ServiceRoute, "id">[]): Promise<{ count: number }> {
        return prisma.serviceRoute.createMany({
            data: routes,
        });
    }

    // Update Operations
    async updateRoute(data: Partial<Omit<ServiceRoute, "id">> & { id: string }): Promise<ServiceRoute> {
        return prisma.serviceRoute.update({
            where: {
                id: data.id,
            },
            data,
        });
    }

    async updateBulkRoutes(routes: (Partial<Omit<ServiceRoute, "id">> & { id: string })[]): Promise<{ count: number }> {
        const promises = routes.map((route) => this.updateRoute(route));
        await Promise.all(promises);
        return { count: routes.length };
    }

    // Delete Operations
    async deleteRoute(id: string): Promise<ServiceRoute> {
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