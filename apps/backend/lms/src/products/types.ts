import type { Router } from "express";

/**
 * Numeric product IDs. Must align with product_id stored in lead_master and offer.
 */
export enum ProductId {
  PERSONAL_LOAN = 2,
  BUSINESS_LOAN = 3,
  CREDIT_CARD = 5,
}

/** URL-safe product slug (route path segment). */
export type ProductSlug = string;

/**
 * Contract every product module must implement.
 * Enables the factory to mount and resolve products uniformly.
 */
export interface IProductModule {
  productId: ProductId;
  slug: ProductSlug;
  router: Router;
  name?: string;
}
