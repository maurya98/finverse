import { logger } from "@finverse/logger";
import { sendError, sendSuccess } from "@finverse/utils";
import { Request, Response, Router } from "express";
import { RouteService } from "../services";

// Controller
export class RouteServiceController {
    public router: Router;
    private routeService: RouteService;

    constructor() {
        this.router = Router();
        this.routeService = RouteService.getInstance();
        this.initRoutes();
    }

    private initRoutes(): void {
        // this.router.post("/", validateBody(loginSchema), this.login.bind(this));
        this.router.post("/", this.createRoute.bind(this));
        this.router.post("/bulk", this.createBulkRoutes.bind(this));
        this.router.get("/:id", this.getRouteById.bind(this));
        this.router.get("/", this.getAllRoutes.bind(this));
        this.router.put("/:id", this.updateRoute.bind(this));
        this.router.put("/bulk", this.updateBulkRoutes.bind(this));
        this.router.delete("/:id", this.deleteRoute.bind(this));
        this.router.delete("/bulk", this.deleteBulkRoutes.bind(this));
    }

    private async createRoute(req: Request, res: Response): Promise<Response> {
        try {
            const { name, serviceId, method, actualPath, exposedPath } = req.body;
            const result = await this.routeService.createRoute({
                name,
                serviceId,
                method,
                actualPath,
                exposedPath,
                createdAt: new Date(),
            });
            return sendSuccess(res, result);
        } catch (error: unknown) {
            logger.error({ error }, "Error in RouteServiceController.createRoute");

            // Check for Prisma foreign key constraint error
            if (isPrismaForeignKeyConstraintError(error)) {
                const constraintName = getPrismaConstraintName(error);
                return sendError(
                    res,
                    `Invalid serviceId provided. No Service exists with id '${req.body.serviceId}'.`,
                    400,
                    [
                        {
                            path: "serviceId",
                            message: `Foreign key constraint failed: ${constraintName}`,
                        }
                    ]
                );
            }

            return sendError(res, "Failed to create route", 500);
        }
    }

    private async createBulkRoutes(req: Request, res: Response): Promise<Response> {
        try {
            const routes = req.body;
            const results = await this.routeService.createBulkRoutes(routes);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in RouteServiceController.createBulkRoutes");
            return sendError(res, "Failed to create bulk routes", 500);
        }
    }

    private async getRouteById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.routeService.getRouteById(id as string);
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in RouteServiceController.getRouteById");
            return sendError(res, "Failed to get route by ID", 500);
        }
    }

    private async getAllRoutes(req: Request, res: Response): Promise<Response> {
        try {
            const results = await this.routeService.getAllRoutes();
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in RouteServiceController.getAllRoutes");
            return sendError(res, "Failed to get all routes", 500);
        }
    }

    private async updateRoute(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.routeService.updateRoute({ id, ...data });
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in RouteServiceController.updateRoute");
            return sendError(res, "Failed to update route", 500);
        }
    }

    private async updateBulkRoutes(req: Request, res: Response): Promise<Response> {
        try {
            const routes = req.body;
            const results = await this.routeService.updateBulkRoutes(routes);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in RouteServiceController.updateBulkRoutes");
            return sendError(res, "Failed to update bulk routes", 500);
        }
    }

    private async deleteRoute(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await this.routeService.deleteRoute(id as string);
            return sendSuccess(res, { message: "Route deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in RouteServiceController.deleteRoute");
            return sendError(res, "Failed to delete route", 500);
        }
    }

    private async deleteBulkRoutes(req: Request, res: Response): Promise<Response> {
        try {
            const { ids } = req.body;
            await this.routeService.deleteBulkRoutes(ids);
            return sendSuccess(res, { message: "Bulk routes deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in RouteServiceController.deleteBulkRoutes");
            return sendError(res, "Failed to delete bulk routes", 500);
        }
    }
}


// Types
type PrismaForeignKeyError = {
    code: string;
    meta?: {
        modelName?: string;
        driverAdapterError?: {
            cause?: {
                constraint?: {
                    index?: string;
                };
            };
        };
    };
};

// Helper Functions
function isPrismaForeignKeyConstraintError(error: unknown): error is PrismaForeignKeyError {
    return (
        error !== null &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2003" &&
        "meta" in error &&
        error.meta !== null &&
        typeof error.meta === "object" &&
        "modelName" in error.meta &&
        error.meta.modelName === "ServiceRoute"
    );
}

function getPrismaConstraintName(error: PrismaForeignKeyError): string {
    return error.meta?.driverAdapterError?.cause?.constraint?.index || "unknown constraint";
}