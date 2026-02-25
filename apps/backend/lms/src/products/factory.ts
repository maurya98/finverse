import type { Router } from "express";
import type { IProductModule } from "./types";
import { ProductId } from "./types";
import { personalLoanModule } from "./personal-loan";
import { businessLoanModule } from "./business-loan";
import { creditCardModule } from "./credit-card";

const byId = new Map<ProductId, IProductModule>();
const bySlug = new Map<string, IProductModule>();

/**
 * Register a product module. Idempotent by productId (re-register overwrites).
 */
export function register(module: IProductModule): void {
  byId.set(module.productId, module);
  bySlug.set(module.slug, module);
}

/**
 * Get product module by numeric product ID.
 */
export function getByProductId(id: ProductId): IProductModule | undefined {
  return byId.get(id);
}

/**
 * Get product module by URL slug (e.g. "personal-loan").
 */
export function getBySlug(slug: string): IProductModule | undefined {
  return bySlug.get(slug);
}

/**
 * Get all registered product modules.
 */
export function getAll(): IProductModule[] {
  return Array.from(byId.values());
}

/**
 * Mount all product routers on the given Express router.
 * @param router - Parent router (e.g. api router).
 * @param basePath - Base path segment, e.g. "/products" → /api/products/personal-loan/...
 */
export function mountAll(router: Router, basePath = "/products"): void {
  for (const product of getAll()) {
    const path = basePath.endsWith("/") ? `${basePath}${product.slug}` : `${basePath}/${product.slug}`;
    router.use(path, product.router);
  }
}

// Register all product modules (Option A: explicit registration)
register(personalLoanModule);
register(businessLoanModule);
register(creditCardModule);
