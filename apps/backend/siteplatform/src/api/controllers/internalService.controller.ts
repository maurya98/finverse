import { logger } from "@finverse/logger";
import { sendError, sendSuccess } from "@finverse/validator";
import { Request, Response, Router } from "express";
import { InternalServiceService } from "../services";

export class InternalServiceController {
    public router: Router;
    private internalServiceService: InternalServiceService;

    constructor() {
        this.router = Router();
        this.internalServiceService = InternalServiceService.getInstance();
        this.initRoutes();
    }

    private initRoutes(): void {
        // this.router.post("/", validateBody(loginSchema), this.login.bind(this));
        this.router.post("/", this.createInternalService.bind(this));
        this.router.post("/bulk", this.createBulkInternalServices.bind(this));
        this.router.get("/:id", this.getInternalService.bind(this));
        this.router.get("/", this.getAllInternalServices.bind(this));
        this.router.put("/:id", this.updateInternalService.bind(this));
        this.router.put("/bulk", this.updateBulkInternalServices.bind(this));
        this.router.delete("/:id", this.deleteInternalService.bind(this));
        this.router.delete("/bulk", this.deleteBulkInternalServices.bind(this));
    }

    private async createInternalService(req: Request, res: Response): Promise<Response> {
        try {
            const { name, baseUrl } = req.body;
            const result = await this.internalServiceService.createInternalService({
                name, baseUrl, createdAt: new Date(),
            });
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.createInternalService");
            return sendError(res, "Failed to create internal service", 500);
        }
    }

    private async createBulkInternalServices(req: Request, res: Response): Promise<Response> {
        try {
            const internalServices = req.body;
            const results = await this.internalServiceService.createBulkInternalServices(internalServices);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.createBulkInternalServices");
            return sendError(res, "Failed to create bulk internal services", 500);
        }
    }

    private async getInternalService(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.internalServiceService.getInternalServiceById(id as string);
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.getInternalServiceById");
            return sendError(res, "Failed to get internal service by ID", 500);
        }
    }

    private async getAllInternalServices(req: Request, res: Response): Promise<Response> {
        try {
            const results = await this.internalServiceService.getAllInternalServices();
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.getAllInternalServices");
            return sendError(res, "Failed to get all internal services", 500);
        }
    }

    private async updateInternalService(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.internalServiceService.updateInternalService({ id, ...data });
            return sendSuccess(res, result);
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.updateInternalService");
            return sendError(res, "Failed to update internal service", 500);
        }
    }

    private async updateBulkInternalServices(req: Request, res: Response): Promise<Response> {
        try {
            const internalServices = req.body;
            const results = await this.internalServiceService.updateBulkInternalServices(internalServices);
            return sendSuccess(res, results);
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.updateBulkInternalServices");
            return sendError(res, "Failed to update bulk internal services", 500);
        }
    }

    private async deleteInternalService(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            await this.internalServiceService.deleteInternalService(id as string);
            return sendSuccess(res, { message: "Internal service deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.deleteInternalService");
            return sendError(res, "Failed to delete internal service", 500);
        }
    }

    private async deleteBulkInternalServices(req: Request, res: Response): Promise<Response> {
        try {
            const { ids } = req.body;
            await this.internalServiceService.deleteBulkInternalServices(ids);
            return sendSuccess(res, { message: "Bulk internal services deleted successfully" });
        } catch (error) {
            logger.error({ error }, "Error in InternalServiceController.deleteBulkInternalServices");
            return sendError(res, "Failed to delete bulk internal services", 500);
        }
    }

}