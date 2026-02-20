import { Lead, Prisma } from "../../../generated/prisma";
import { prisma } from "../../../databases/client";

export class LeadService {
    private static instance: LeadService;

    static getInstance(): LeadService {
        if (!LeadService.instance) {
            LeadService.instance = new LeadService();
        }
        return LeadService.instance;
    }

    // Read Operations
    async getLeadById(lead_id: string): Promise<Lead | null> {
        return prisma.lead.findUnique({
            where: {
                lead_id,
            },
        });
    }

    async getAllLeads(): Promise<Lead[]> {
        return prisma.lead.findMany();
    }

    // Create Operations
    async createLead(data: Prisma.LeadCreateInput): Promise<Lead> {
        return prisma.lead.create({
            data
        });
    }

    async createBulkLeads(cards: Prisma.LeadCreateManyInput[]): Promise<{ count: number }> {
        return prisma.lead.createMany({
            data: cards,
        });
    }

    // Update Operations
    async updateLead(lead_id: string, data: Prisma.LeadUpdateInput): Promise<Lead> {
        return prisma.lead.update({
            where: {
                lead_id,
            },
            data,
        });
    }

    async updateBulkLeads(cards: (Prisma.LeadUpdateInput & { lead_id: string })[]): Promise<{ count: number }> {
        const promises = cards.map((card) => {
            const { lead_id, ...updateData } = card as any;
            return this.updateLead(lead_id, updateData);
        });
        await Promise.all(promises);
        return { count: cards.length };
    }

    // Delete Operations
    async deleteLead(lead_id: string): Promise<Lead> {
        return prisma.lead.delete({
            where: {
                lead_id,
            },
        });
    }

    async deleteBulkLeads(cards: { lead_id: string }[]): Promise<{ count: number }> {
        const promises = cards.map((card) => this.deleteLead(card.lead_id));
        await Promise.all(promises);
        return { count: cards.length };
    }
}
