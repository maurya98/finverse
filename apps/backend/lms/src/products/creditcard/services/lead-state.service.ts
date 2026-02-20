import { LeadState, Prisma } from "../../../generated/prisma";
import { prisma } from "../../../databases/client";

export class LeadStateService {
	private static instance: LeadStateService;

	static getInstance(): LeadStateService {
		if (!LeadStateService.instance) {
			LeadStateService.instance = new LeadStateService();
		}
		return LeadStateService.instance;
	}

	// Read Operations
	async getLeadStatesByLeadId(lead_id: string): Promise<LeadState[]> {
		return prisma.leadState.findMany({
			where: {
				lead_id,
			},
		});
	}

	async getAllLeadStates(): Promise<LeadState[]> {
		return prisma.leadState.findMany();
	}

	// Create Operations
	async createLeadState(data: Prisma.LeadStateCreateInput): Promise<LeadState> {
		return prisma.leadState.create({
			data
		});
	}

	async createBulkLeadStates(cards: Prisma.LeadStateCreateManyInput[]): Promise<{ count: number }> {
		return prisma.leadState.createMany({
			data: cards,
		});
	}

	// Update Operations
	async updateLeadState(lead_id: string, data: Prisma.LeadStateUpdateInput): Promise<{ count: number }> {
		const result = await prisma.leadState.updateMany({
			where: {
				lead_id,
			},
			data,
		});
		return { count: result.count };
	}

	async updateBulkLeadStates(updates: (Prisma.LeadStateUpdateInput & { lead_id: string })[]): Promise<{ count: number }> {
		let totalCount = 0;
		for (const update of updates) {
			const { lead_id, ...updateData } = update as any;
			const result = await this.updateLeadState(lead_id, updateData);
			totalCount += result.count;
		}
		return { count: totalCount };
	}

	// Delete Operations
	async deleteLeadState(lead_id: string): Promise<{ count: number }> {
		const result = await prisma.leadState.deleteMany({
			where: {
				lead_id,
			},
		});
		return { count: result.count };
	}

	async deleteBulkLeadStates(leadIds: { lead_id: string }[]): Promise<{ count: number }> {
		let totalCount = 0;
		for (const { lead_id } of leadIds) {
			const result = await this.deleteLeadState(lead_id);
			totalCount += result.count;
		}
		return { count: totalCount };
	}
}
