import { MobileVerification, Prisma } from "../../../generated/prisma";
import { prisma } from "../../../databases/client";

export class MobileVerificationService {
    private static instance: MobileVerificationService;

    static getInstance(): MobileVerificationService {
        if (!MobileVerificationService.instance) {
            MobileVerificationService.instance = new MobileVerificationService();
        }
        return MobileVerificationService.instance;
    }

    // Read Operations
    async getMobileVerificationById(verification_id: string): Promise<MobileVerification | null> {
        return prisma.mobileVerification.findUnique({
            where: {
                verification_id,
            },
        });
    }

    async getAllMobileVerifications(): Promise<MobileVerification[]> {
        return prisma.mobileVerification.findMany();
    }

    // Create Operations
    async createMobileVerification(data: Prisma.MobileVerificationCreateInput): Promise<MobileVerification> {
        return prisma.mobileVerification.create({
            data
        });
    }

    async createBulkMobileVerifications(cards: Prisma.MobileVerificationCreateManyInput[]): Promise<{ count: number }> {
        return prisma.mobileVerification.createMany({
            data: cards,
        });
    }

    // Update Operations
    async updateMobileVerification(verification_id: string, data: Prisma.MobileVerificationUpdateInput): Promise<MobileVerification> {
        return prisma.mobileVerification.update({
            where: {
                verification_id,
            },
            data,
        });
    }

    async updateBulkMobileVerifications(cards: (Prisma.MobileVerificationUpdateInput & { verification_id: string })[]): Promise<{ count: number }> {
        const promises = cards.map((card) => {
            const { verification_id, ...updateData } = card as any;
            return this.updateMobileVerification(verification_id, updateData);
        });
        await Promise.all(promises);
        return { count: cards.length };
    }

    // Delete Operations
    async deleteMobileVerification(verification_id: string): Promise<MobileVerification> {
        return prisma.mobileVerification.delete({
            where: {
                verification_id,
            },
        });
    }

    async deleteBulkMobileVerifications(cards: { verification_id: string }[]): Promise<{ count: number }> {
        const promises = cards.map((card) => this.deleteMobileVerification(card.verification_id));
        await Promise.all(promises);
        return { count: cards.length };
    }
}
