import { CreditCard, Prisma } from "../../../generated/prisma";
import { prisma } from "../../../databases/client";

export class CreditCardService {
    private static instance: CreditCardService;

    static getInstance(): CreditCardService {
        if (!CreditCardService.instance) {
            CreditCardService.instance = new CreditCardService();
        }
        return CreditCardService.instance;
    } 

    // Read Operations
    async getCreditCardById(id: string): Promise<CreditCard | null> {
        return prisma.creditCard.findUnique({
            where: {
                id,
            },
        });
    }

    async getAllCreditCards(): Promise<CreditCard[]> {
        return prisma.creditCard.findMany();
    }

    // Create Operations
    async createCreditCard(data: Prisma.CreditCardCreateInput): Promise<CreditCard> {
        return prisma.creditCard.create({
            data
        });
    }

    async createBulkCreditCards(cards: Prisma.CreditCardCreateManyInput[]): Promise<{ count: number }> {
        return prisma.creditCard.createMany({
            data: cards,
        });
    }

    // Update Operations
    async updateCreditCard(id: string, data: Prisma.CreditCardUpdateInput): Promise<CreditCard> {
        return prisma.creditCard.update({
            where: {
                id,
            },
            data,
        });
    }

    async updateBulkCreditCards(cards: (Prisma.CreditCardUpdateInput & { id: string })[]): Promise<{ count: number }> {
        const promises = cards.map((card) => {
            const { id, ...updateData } = card as any;
            return this.updateCreditCard(id, updateData);
        });
        await Promise.all(promises);
        return { count: cards.length };
    }

    // Delete Operations
    async deleteCreditCard(id: string): Promise<CreditCard> {
        return prisma.creditCard.delete({
            where: {
                id,
            },
        });
    }

    async deleteBulkCreditCards(cards: { id: string }[]): Promise<{ count: number }> {
        const promises = cards.map((card) => this.deleteCreditCard(card.id));
        await Promise.all(promises);
        return { count: cards.length };
    }
}
