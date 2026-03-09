import type { Prisma } from "../database/generated/prisma/client";
import { prisma } from "../database/client";

/** Customer create input (excludes id, createdAt, updatedAt; relations optional) */
export type CustomerCreateInput = Prisma.CustomerCreateInput;

/** Customer update input (all Customer fields optional except relations) */
export type CustomerUpdateInput = Prisma.CustomerUpdateInput;

/** Payload returned from Prisma for Customer */
export type CustomerPayload = Prisma.CustomerGetPayload<object>;

/** Filter for getCustomer: by id, or by one of email / phone (for active customers) */
export type GetCustomerFilter =
  | { id: number }
  | { email: string }
  | { phone: string };

/** Options for getBulkCustomers (pagination + optional active filter) */
export type GetBulkCustomersOptions = {
  skip?: number;
  take?: number;
  is_active?: boolean;
  ids?: number[];
  includeRelations?: boolean;
};

/** Item for bulk update: id + partial update fields */
export type CustomerBulkUpdateItem = { id: number } & Prisma.CustomerUpdateInput;

/** Include all customer relations for GET */
const CUSTOMER_INCLUDE_RELATIONS = {
  address: true,
  utmSources: true,
  gstDetails: true,
  bureauScores: true,
  deviceDetails: true,
  companyDetails: true,
  paStampMaster: true,
} as const;

export type CustomerWithRelations = Prisma.CustomerGetPayload<{
  include: typeof CUSTOMER_INCLUDE_RELATIONS;
}>;

/** Relation keys that accept array payloads (converted to { create: array } for Prisma) */
const RELATION_KEYS = [
  "address",
  "utmSources",
  "gstDetails",
  "bureauScores",
  "deviceDetails",
  "companyDetails",
  "paStampMaster",
] as const;

/**
 * Normalizes API payload: relation keys with array values become { create: array } for Prisma.
 * E.g. address: [ { ... } ] → address: { create: [ { ... } ] }
 */
function normalizeRelationArrays<T extends Record<string, unknown>>(data: T): T {
  const out = { ...data } as Record<string, unknown>;
  for (const key of RELATION_KEYS) {
    const v = out[key];
    if (Array.isArray(v)) {
      (out as Record<string, unknown>)[key] = { create: v };
    }
  }
  return out as T;
}

export class CustomerService {
  private static instance: CustomerService;

  private constructor() {}

  static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }
    return CustomerService.instance;
  }

  async createCustomer(data: CustomerCreateInput): Promise<CustomerPayload> {
    const normalized = normalizeRelationArrays(data as Record<string, unknown>) as CustomerCreateInput;
    return prisma.customer.create({ data: normalized });
  }

  /**
   * Create or update a customer by unique key (email or phone).
   * Requires at least one of email or phone in the payload.
   * If a customer exists with that email or phone, it is updated; otherwise a new one is created.
   * Supports nested relation data on both create and update (address, utmSources, gstDetails, etc.).
   */
  async createOrUpdateCustomer(data: CustomerCreateInput): Promise<{ customer: CustomerPayload; created: boolean }> {
    const email = data.email ?? undefined;
    const phone = data.phone ?? undefined;
    if (!email && !phone) {
      throw new Error("At least one of email or phone is required for createOrUpdateCustomer");
    }

    const where = email
      ? { email }
      : { phone: phone! };

    const existing = await prisma.customer.findFirst({ where });
    if (existing) {
      const updateData = { ...data } as Record<string, unknown>;
      delete updateData.id;
      const normalized = normalizeRelationArrays(updateData) as Prisma.CustomerUpdateInput;
      const customer = await prisma.customer.update({
        where: { id: existing.id },
        data: normalized,
      });
      return { customer, created: false };
    }
    const normalized = normalizeRelationArrays(data as Record<string, unknown>) as CustomerCreateInput;
    const customer = await prisma.customer.create({ data: normalized });
    return { customer, created: true };
  }

  async getCustomer(filter: GetCustomerFilter,includeRelations?: boolean): Promise<CustomerPayload | CustomerWithRelations | null> {
    const include = includeRelations ? CUSTOMER_INCLUDE_RELATIONS : undefined;
    if ("id" in filter) {
      return prisma.customer.findUnique({
        where: { id: filter.id },
        ...(include && { include }),
      }) as Promise<CustomerPayload | CustomerWithRelations | null>;
    }
    if ("email" in filter) {
      return prisma.customer.findFirst({
        where: { email: filter.email, is_active: true },
        ...(include && { include }),
      }) as Promise<CustomerPayload | CustomerWithRelations | null>;
    }
    if ("phone" in filter) {
      return prisma.customer.findFirst({
        where: { phone: filter.phone, is_active: true },
        ...(include && { include }),
      }) as Promise<CustomerPayload | CustomerWithRelations | null>;
    }
    return null;
  }

  async updateCustomer(id: number,data: CustomerUpdateInput): Promise<CustomerPayload> {
    const normalized = normalizeRelationArrays(data as Record<string, unknown>) as CustomerUpdateInput;
    return prisma.customer.update({
      where: { id },
      data: normalized,
    });
  }

  async deleteCustomer(id: number): Promise<CustomerPayload> {
    return prisma.customer.delete({
      where: { id },
    });
  }

  /** Soft delete: set is_active = false */
  async softDeleteCustomer(id: number): Promise<CustomerPayload> {
    return prisma.customer.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async getBulkCustomers(options: GetBulkCustomersOptions = {}): Promise<(CustomerPayload | CustomerWithRelations)[]> {
    const { skip = 0, take = 100, is_active, ids, includeRelations } = options;
    const where: Prisma.CustomerWhereInput = {};
    if (is_active !== undefined) where.is_active = is_active;
    if (ids !== undefined && ids.length > 0) where.id = { in: ids };

    const include = includeRelations ? CUSTOMER_INCLUDE_RELATIONS : undefined;
    return prisma.customer.findMany({
      where,
      skip,
      take: Math.min(take, 500),
      orderBy: { id: "asc" },
      ...(include && { include }),
    }) as Promise<(CustomerPayload | CustomerWithRelations)[]>;
  }

  async createBulkCustomers(items: CustomerCreateInput[]): Promise<{ count: number; customers: CustomerPayload[] }> {
    if (items.length === 0) {
      return { count: 0, customers: [] };
    }
    const created: CustomerPayload[] = [];
    for (const data of items) {
      const normalized = normalizeRelationArrays(data as Record<string, unknown>) as CustomerCreateInput;
      const customer = await prisma.customer.create({ data: normalized });
      created.push(customer);
    }
    return { count: created.length, customers: created };
  }

  async updateBulkCustomers(items: CustomerBulkUpdateItem[]): Promise<{ count: number; customers: CustomerPayload[] }> {
    if (items.length === 0) {
      return { count: 0, customers: [] };
    }
    const updated: CustomerPayload[] = [];
    for (const item of items) {
      const { id, ...data } = item;
      const normalized = normalizeRelationArrays(data as Record<string, unknown>) as Prisma.CustomerUpdateInput;
      const customer = await prisma.customer.update({
        where: { id },
        data: normalized,
      });
      updated.push(customer);
    }
    return { count: updated.length, customers: updated };
  }

  async deleteBulkCustomers(ids: number[],soft: boolean = false): Promise<{ count: number }> {
    if (ids.length === 0) {
      return { count: 0 };
    }
    if (soft) {
      await prisma.customer.updateMany({
        where: { id: { in: ids } },
        data: { is_active: false },
      });
      return { count: ids.length };
    }
    const result = await prisma.customer.deleteMany({
      where: { id: { in: ids } },
    });
    return { count: result.count };
  }
}
