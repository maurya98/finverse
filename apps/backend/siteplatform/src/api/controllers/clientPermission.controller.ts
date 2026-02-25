import { logger } from "@finverse/logger";
import { sendError, sendSuccess } from "@finverse/utils";
import { Request, Response, Router } from "express";
import { ClientPermissionService } from "../services";

export class ClientPermissionController {
    public router: Router;
    private internalServiceService: ClientPermissionService;

    constructor() {
        this.router = Router();
        this.internalServiceService = ClientPermissionService.getInstance();
        this.initRoutes();
    }

    private initRoutes(): void {
        // this.router.post("/", validateBody(loginSchema), this.login.bind(this));
        this.router.post("/", this.createClientPermission.bind(this));
        this.router.post("/bulk", this.createBulkClientPermissions.bind(this));
        this.router.get("/:id", this.getClientPermissionById.bind(this));
        this.router.get("/", this.getAllClientPermissions.bind(this));
        this.router.put("/:id", this.updateClientPermission.bind(this));
        this.router.put("/bulk", this.updateBulkClientPermissions.bind(this));
        this.router.delete("/:id", this.deleteClientPermission.bind(this));
        this.router.delete("/bulk", this.deleteBulkClientPermissions.bind(this));
    }

    private async createClientPermission(req: Request, res: Response): Promise<Response> {
        try {
            const { clientId, routeId, scope } = req.body;
            const result = await this.internalServiceService.createClientPermission({
                clientId, routeId, scope,
            });
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.createClientPermission");
            return sendError(res, "Failed to create client permission", 500);
        }
    }

    private async createBulkClientPermissions(req: Request, res: Response): Promise<Response> {
        try {
            const clientPermissions = req.body;
            const results = await this.internalServiceService.createBulkClientPermissions(clientPermissions);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.createBulkClientPermissions");
            return sendError(res, "Failed to create bulk client permissions", 500);
        }
    }

    private async getClientPermissionById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.internalServiceService.getClientPermissionById(id as string);
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.getClientPermissionById");
            return sendError(res, "Failed to get client permission by ID", 500);
        }
    }

    private async getAllClientPermissions(req: Request, res: Response): Promise<Response> {
        try {
            const results = await this.internalServiceService.getAllClientPermissions();
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.getAllClientPermissions");
            return sendError(res, "Failed to get all client permissions", 500);
        }
    }

    private async updateClientPermission(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.internalServiceService.updateClientPermission({ id, ...data });
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.updateClientPermission");
            return sendError(res, "Failed to update client permission", 500);
        }
    }

    private async updateBulkClientPermissions(req: Request, res: Response): Promise<Response> {
        try {
            const clientPermissions = req.body;
            const results = await this.internalServiceService.updateBulkClientPermissions(clientPermissions);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.updateBulkClientPermissions");
            return sendError(res, "Failed to update bulk client permissions", 500);
        }
    }

    private async deleteClientPermission(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await this.internalServiceService.deleteClientPermission(id as string);
            return sendSuccess(res, { message: "Client permission deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.deleteClientPermission");
            return sendError(res, "Failed to delete client permission", 500);
        }
    }

    private async deleteBulkClientPermissions(req: Request, res: Response): Promise<Response> {
        try {
            const { ids } = req.body;
            await this.internalServiceService.deleteBulkClientPermissions(ids);
            return sendSuccess(res, { message: "Bulk client permissions deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in ClientPermissionController.deleteBulkClientPermissions");
            return sendError(res, "Failed to delete bulk client permissions", 500);
        }
    }

}