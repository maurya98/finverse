import { Request, Response, Router } from "express";
import { CreditCardService } from "../services/cc.service";
import { sendSuccess, sendError } from "@finverse/validator";
import { LeadService } from "../services/lead.service";
import { LeadData } from "../types/cc.types";
import { CC_STAGES } from "../../utils/journeyStages";

export class CreditCardController {
    public router: Router;
    private creditCardService: CreditCardService;
    private leadService: LeadService

    constructor() {
        this.router = Router();
        this.creditCardService = new CreditCardService();
        this.leadService = new LeadService();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get("/createOrUpdateLead", this.createOrUpdateLead.bind(this));
    }

    private createOrUpdateLead = (async (req: Request, res: Response) => {
        try {
            // Get the values from the request body
            const leadData: LeadData = req.body;

            // Validate the input values

            // Create a new lead using Customer ID
            const result = await this.leadService.createLead({
                product_id: leadData.product_id,
                customer_id: leadData.customer_id,
                lead_stage: leadData.lead_stage || CC_STAGES.CREATE_LEAD,
                mobile_no: leadData.mobile_no
            });

            // Update Personal Details
            const personalDetails = await this.leadService.updateLead(result.lead_id, {
                
            })

            /* 
                "full_name": "",
                "email": "",
                "gender": "",
                "dob": "",
                "pincode": ""
            */

            // Update PAN Details

            // Update Employment Details

            sendSuccess(res, result);
        } catch (error) {
            sendError(res, "Failed to create/update lead", 500);
        }
    })
}