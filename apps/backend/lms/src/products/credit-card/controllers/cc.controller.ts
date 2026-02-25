import { Request, Response, Router } from "express";
import { sendSuccess, sendError } from "@finverse/utils";
import { CreditCardService } from "../services/cc.service";
import type { LeadData } from "../services/cc.service";

export class CreditCardController {
    public router: Router;
    private creditCardService: CreditCardService;

    constructor() {
        this.router = Router();
        this.creditCardService = new CreditCardService();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post("/createOrUpdateLead", this.createOrUpdateLead.bind(this));
    }

    private async createOrUpdateLead(req: Request, res: Response): Promise<Response> {
        try {
            const lead = req.body as LeadData;
            const result = await this.creditCardService.createOrUpdateLead(lead);
            return sendSuccess(res, result, 200, "Lead created or updated successfully");
        } catch (error) {
            return sendError(res, error instanceof Error ? error.message : "Internal server error");
        }
    }
}

export default CreditCardController;