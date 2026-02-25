import { logger } from "@finverse/logger";
import { prisma } from "../../../databases/client";
import type { Prisma } from "../../../databases/generated/prisma";
import { creditCardModule } from "..";
import { maskPI } from "@finverse/utils";
import { getPanDetails } from "../../../common/kyc";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Lead identifier: either lead_id (continue journey) or (customer_id + mobile_no) */
export interface LeadIdentifier {
    lead_id?: string;
    customer_id: string;
    mobile_no: string;
}

export interface LeadData extends LeadIdentifier {
    product_id?: number;
    lead_stage?: string;
    /** Optional fields that may be sent in any stage to update lead_master */
    fname?: string;
    lname?: string;
    gender?: string;
    email?: string;
    dob?: string; // ISO date string
    pincode?: number;
    pan_card?: string;
    employment_type?: number;
    income?: number;
    company_name?: string;
    city?: string;
    segment?: string;
    visit_id?: string;
    utm_source?: string;
    optional_info?: Record<string, unknown>;
}

/** Result returned after processing a lead stage */
export type LeadStageResult = {
    lead_id: string;
    lead_stage: string;
    next_stage: string;
    [k: string]: unknown;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const product_id = creditCardModule.productId;

/** Stage order: each key leads to the next stage. "offer_creation" is terminal. */
const STAGE_FLOW: Record<string, string> = {
    initiated: "customer_details",
    customer_details: "address_details",
    address_details: "pan_verification",
    pan_verification: "employment_details",
    employment_details: "offer_creation",
    offer_creation: "offer_creation",
};

// ---------------------------------------------------------------------------
// Lead lookup & update helpers
// ---------------------------------------------------------------------------

/**
 * Find active lead by lead_id OR (product_id + customer_id + mobile_no).
 * Returns null if neither identifier is valid or lead not found.
 */
async function findLead(lead: LeadData): Promise<Awaited<ReturnType<typeof prisma.lead_master.findFirst>>> {
    const { lead_id, customer_id, mobile_no } = lead;
    if (!customer_id || !mobile_no) {
        logger.warn({ customer_id, mobile_no }, "findLead: missing customer_id or mobile_no");
        return null;
    }

    const where: Prisma.lead_masterWhereInput = {
        is_active: true,
        OR: [
            ...(lead_id ? [{ lead_id }] : []),
            { product_id, customer_id, mobile_no },
        ],
    };

    return prisma.lead_master.findFirst({ where });
}

/**
 * Get existing lead or throw. Use when the stage requires a lead to already exist.
 */
async function getExistingLeadOrThrow(lead: LeadData,stageName: string): Promise<NonNullable<Awaited<ReturnType<typeof prisma.lead_master.findFirst>>>> {
    const existing = await findLead(lead);
    if (!existing) {
        logger.warn({ lead }, `${stageName}: lead not found`);
        throw new Error("Lead not found. Start with initiated stage.");
    }
    return existing;
}

/**
 * Build update payload for lead_master from lead payload (only defined fields).
 */
function buildLeadMasterUpdate(lead: LeadData): Record<string, unknown> {
    const updates: Record<string, unknown> = {};
    if (lead.fname !== undefined) updates.fname = lead.fname;
    if (lead.lname !== undefined) updates.lname = lead.lname;
    if (lead.gender !== undefined) updates.gender = lead.gender;
    if (lead.email !== undefined) updates.email = lead.email;
    if (lead.dob !== undefined) updates.dob = new Date(lead.dob);
    if (lead.pincode !== undefined) updates.pincode = lead.pincode;
    if (lead.pan_card !== undefined) updates.pan_card = lead.pan_card;
    if (lead.employment_type !== undefined) updates.employment_type = lead.employment_type;
    if (lead.income !== undefined) updates.income = lead.income;
    if (lead.company_name !== undefined) updates.company_name = lead.company_name;
    if (lead.city !== undefined) updates.city = lead.city;
    if (lead.segment !== undefined) updates.segment = lead.segment;
    if (lead.visit_id !== undefined) updates.visit_id = lead.visit_id;
    if (lead.utm_source !== undefined) updates.utm_source = lead.utm_source;
    if (lead.optional_info !== undefined) updates.optional_info = lead.optional_info;
    return updates;
}

/**
 * Apply updates to lead_master if any. No-op when updates is empty.
 */
async function applyLeadUpdates(leadId: string,updates: Record<string, unknown>): Promise<void> {
    if (Object.keys(updates).length === 0) return;
    await prisma.lead_master.update({
        where: { lead_id: leadId },
        data: updates as Prisma.lead_masterUpdateInput,
    });
}

/**
 * Build the standard result object for a stage (lead data + current stage + next stage).
 */
async function buildStageResult(leadId: string,lead_stage: string,next_stage: string): Promise<LeadStageResult> {
    const updated = await prisma.lead_master.findUnique({ where: { lead_id: leadId } });
    return {
        ...updated,
        lead_stage,
        next_stage,
    } as LeadStageResult;
}

// ---------------------------------------------------------------------------
// Stage logging
// ---------------------------------------------------------------------------

/** Log one step of the lead journey to lead_stage. */
async function logLeadStage(lead_id: string,stage_name: string,journey_details: Record<string, unknown>,stage_description: string): Promise<void> {
    await prisma.lead_stage.create({
        data: {
            lead_id,
            stage_name,
            journey_details: journey_details as Prisma.InputJsonValue,
            stage_description,
            is_active: true,
        },
    });
}

// ---------------------------------------------------------------------------
// External integrations (KYC)
// ---------------------------------------------------------------------------

/**
 * Verify PAN via KYC API (Digitap). Uses lead_id as client_ref_num.
 * Returns valid: true when PAN is valid; otherwise valid: false with message.
 */
export async function verifyPanWithName(pan: string, name: string): Promise<{ valid: boolean; message?: string }> {
    const result = await getPanDetails(pan, name);
    return { valid: result.valid, message: result.message };
}

// ---------------------------------------------------------------------------
// Credit card lead service
// ---------------------------------------------------------------------------

/**
 * Handles the credit card lead journey: create/update lead_master and log each
 * stage. Each request is processed by the stage given in lead_stage (default "initiated").
 */
export class CreditCardService {

    /**
     * Process the lead for the current stage and return lead_id, lead_stage, next_stage.
     * Dispatches to the right handler based on lead.lead_stage.
     */
    public async createOrUpdateLead(lead: LeadData): Promise<LeadStageResult> {
        const lead_stage = lead.lead_stage ?? "initiated";

        const stageHandlers: Record<string, (data: LeadData) => Promise<LeadStageResult>> = {
            initiated: (d) => this.processInitiated(d),
            customer_details: (d) => this.processCustomerDetails(d),
            address_details: (d) => this.processAddressDetails(d),
            pan_verification: (d) => this.processPanVerification(d),
            employment_details: (d) => this.processEmploymentDetails(d),
            offer_creation: (d) => this.processOfferCreation(d),
        };

        const handler = stageHandlers[lead_stage];
        if (!handler) {
            logger.warn({ lead_stage }, "Unknown lead_stage");
            throw new Error(`Unknown lead_stage: ${lead_stage}`);
        }

        return handler(lead);
    }

    private async processInitiated(lead: LeadData): Promise<LeadStageResult> {
        const { customer_id, mobile_no } = lead;
        const next_stage = STAGE_FLOW.initiated;
        const existing = await findLead(lead);

        if (existing) {
            await logLeadStage(
                existing.lead_id,
                "initiated",
                { ...lead, lead_stage: "initiated", next_stage },
                `Lead continue journey | customer_id: ${customer_id} | Mobile: ${maskPI(mobile_no)}`
            );
            logger.info({ lead_id: existing.lead_id }, "Lead already exists, logged initiated activity");
            return {
                ...existing,
                lead_stage: "initiated",
                next_stage,
            } as LeadStageResult;
        }

        const new_lead = await prisma.lead_master.create({
            data: { customer_id, mobile_no, product_id, is_active: true },
        });

        await logLeadStage(
            new_lead.lead_id,
            "initiated",
            { ...lead, lead_stage: "initiated", next_stage },
            `Lead initiated | customer_id: ${customer_id} | Mobile: ${maskPI(mobile_no)}`
        );

        return {
            ...new_lead,
            lead_stage: "initiated",
            next_stage,
        } as LeadStageResult;
    }

    private async processCustomerDetails(lead: LeadData): Promise<LeadStageResult> {
        const existing = await getExistingLeadOrThrow(lead, "processCustomerDetails");
        const next_stage = STAGE_FLOW.customer_details;

        await applyLeadUpdates(existing.lead_id, buildLeadMasterUpdate(lead));

        await logLeadStage(
            existing.lead_id,
            "customer_details",
            { ...lead, lead_stage: "customer_details", next_stage },
            `Customer details | fname: ${lead.fname ?? "-"} | email: ${lead.email ? maskPI(lead.email) : "-"}`
        );

        return buildStageResult(existing.lead_id, "customer_details", next_stage);
    }

    private async processAddressDetails(lead: LeadData): Promise<LeadStageResult> {
        const existing = await getExistingLeadOrThrow(lead, "processAddressDetails");
        const next_stage = STAGE_FLOW.address_details;

        await applyLeadUpdates(existing.lead_id, buildLeadMasterUpdate(lead));

        await logLeadStage(
            existing.lead_id,
            "address_details",
            { ...lead, lead_stage: "address_details", next_stage },
            `Address details | pincode: ${lead.pincode ?? "-"} | dob: ${lead.dob ?? "-"}`
        );

        return buildStageResult(existing.lead_id, "address_details", next_stage);
    }

    private async processPanVerification(lead: LeadData): Promise<LeadStageResult> {
        const existing = await getExistingLeadOrThrow(lead, "processPanVerification");
        const next_stage = STAGE_FLOW.pan_verification;

        if (!lead.pan_card) {
            throw new Error("pan_card is required for pan_verification stage.");
        }

        const fullName = [existing.fname, existing.lname].filter(Boolean).join(" ")
            || [lead.fname, lead.lname].filter(Boolean).join(" ");
        const verifyResult = await verifyPanWithName(lead.pan_card, fullName);
        if (!verifyResult.valid) {
            logger.warn({ pan: maskPI(lead.pan_card), name: fullName }, "PAN verification failed");
            throw new Error(verifyResult.message ?? "PAN verification failed.");
        }

        await applyLeadUpdates(existing.lead_id, buildLeadMasterUpdate(lead));

        await logLeadStage(
            existing.lead_id,
            "pan_verification",
            { ...lead, lead_stage: "pan_verification", next_stage },
            `PAN verified | PAN: ${maskPI(lead.pan_card)}`
        );

        return buildStageResult(existing.lead_id, "pan_verification", next_stage);
    }

    private async processEmploymentDetails(lead: LeadData): Promise<LeadStageResult> {
        const existing = await getExistingLeadOrThrow(lead, "processEmploymentDetails");
        const next_stage = STAGE_FLOW.employment_details;

        await applyLeadUpdates(existing.lead_id, buildLeadMasterUpdate(lead));

        await logLeadStage(
            existing.lead_id,
            "employment_details",
            { ...lead, lead_stage: "employment_details", next_stage },
            `Employment details | employment_type: ${lead.employment_type ?? "-"} | income: ${lead.income ?? "-"}`
        );

        const result = await buildStageResult(existing.lead_id, "employment_details", next_stage);

        // Automatically advance to offer_creation once employment details are saved.
        await this.processOfferCreation({ ...lead, lead_id: existing.lead_id });

        return result;
    }

    private async processOfferCreation(lead: LeadData): Promise<LeadStageResult> {
        const existing = await getExistingLeadOrThrow(lead, "processOfferCreation");
        const next_stage = STAGE_FLOW.offer_creation;

        await logLeadStage(
            existing.lead_id,
            "offer_creation",
            { ...lead, lead_stage: "offer_creation", next_stage },
            `Offer creation step completed for lead ${existing.lead_id}`
        );

        return buildStageResult(existing.lead_id, "offer_creation", next_stage);
    }
}
