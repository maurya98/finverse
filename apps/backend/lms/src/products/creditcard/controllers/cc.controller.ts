import { Request, Response, Router } from "express";
import { CreditCardService } from "../services/cc.service";
import { sendSuccess, sendError } from "@finverse/utils";

export class CreditCardController {
    public router: Router;
    private creditCardService: CreditCardService;

    constructor() {
        this.router = Router();
        this.creditCardService = new CreditCardService();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get("/createOrUpdateLead", this.createOrUpdateLead.bind(this));
    }

    private async createOrUpdateLead(req: Request, res: Response): Promise<Response> {
        try {
            return sendSuccess(res, { message: "Credit cards fetched successfully" });
        } catch (error) {
            return sendError(res, "Failed to fetch credit cards", 500);
        }
    }
}