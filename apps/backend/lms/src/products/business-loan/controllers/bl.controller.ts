import { Request, Response, Router } from "express";
import { sendSuccess, sendError } from "@finverse/utils";

export class BusinessLoanController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post("/createOrUpdateLead", this.createOrUpdateLead.bind(this));
    }

    private async createOrUpdateLead(req: Request, res: Response): Promise<Response> {
        try {
            return sendSuccess(res, undefined, 200, "Lead created or updated successfully");
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : "Internal server error");
        }
    }
}

export default BusinessLoanController;