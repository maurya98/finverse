import { logger } from "@finverse/logger";
import { sendError, sendSuccess } from "@finverse/utils";
import { Request, Response, Router } from "express";
import { ClientAppService } from "../services";

export class ClientAppController {
    public router: Router;
    private clientAppService: ClientAppService;

    constructor() {
        this.router = Router();
        this.clientAppService = ClientAppService.getInstance();
        this.initRoutes();
    }

    private initRoutes(): void {
        // this.router.post("/", validateBody(loginSchema), this.login.bind(this));
        this.router.post("/", this.createApplication.bind(this));
        this.router.post("/bulk", this.createBulkApplications.bind(this));
        this.router.get("/:id", this.getApplicationById.bind(this));
        this.router.get("/", this.getAllApplications.bind(this));
        this.router.put("/:id", this.updateApplication.bind(this));
        this.router.put("/bulk", this.updateBulkApplications.bind(this));
        this.router.delete("/:id", this.deleteApplication.bind(this));
        this.router.delete("/bulk", this.deleteBulkApplications.bind(this));
    }

    private async createApplication(req: Request, res: Response): Promise<Response> {
        try {
            const { name } = req.body;
            const result = await this.clientAppService.createClientApp({ name, createdAt: new Date() });
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.createApplication");
            return sendError(res, "Failed to create client application", 500);
        }
    }

    private async createBulkApplications(req: Request, res: Response): Promise<Response> {
        try {
            const applications = req.body;
            const results = await this.clientAppService.createBulkClientApps(applications);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.createBulkApplications");
            return sendError(res, "Failed to create bulk client applications", 500);
        }
    }

    private async getApplicationById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.clientAppService.getClientAppById(id as string);
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.getApplicationById");
            return sendError(res, "Failed to get client application by ID", 500);
        }
    }

    private async getAllApplications(req: Request, res: Response): Promise<Response> {
        try {
            const results = await this.clientAppService.getAllClientApps();
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.getAllApplications");
            return sendError(res, "Failed to get all client applications", 500);
        }
    }

    private async updateApplication(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.clientAppService.updateClientApp({ id, ...data });
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.updateApplication");
            return sendError(res, "Failed to update client application", 500);
        }
    }

    private async updateBulkApplications(req: Request, res: Response): Promise<Response> {
        try {
            const applications = req.body;
            const results = await this.clientAppService.updateBulkClientApps(applications);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.updateBulkApplications");
            return sendError(res, "Failed to update bulk client applications", 500);
        }
    }

    private async deleteApplication(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await this.clientAppService.deleteClientApp(id as string);
            return sendSuccess(res, { message: "Client application deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.deleteApplication");
            return sendError(res, "Failed to delete client application", 500);
        }
    }

    private async deleteBulkApplications(req: Request, res: Response): Promise<Response> {
        try {
            const { ids } = req.body;
            await this.clientAppService.deleteBulkClientApps(ids);
            return sendSuccess(res, { message: "Bulk client applications deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in ClientAppController.deleteBulkApplications");
            return sendError(res, "Failed to delete bulk client applications", 500);
        }
    }

}