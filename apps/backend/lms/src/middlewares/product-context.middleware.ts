/// <reference path="../types/express.d.ts" />
import type { Request, Response, NextFunction } from "express";
import { getBySlug } from "../products/factory";

/**
 * Resolves the current product from the URL path and attaches it to the request.
 * Expects path like .../products/:slug/... (e.g. /api/products/personal-loan/...).
 * Parses the first path segment after "products" and looks up the product by slug.
 * Mount this on the router that serves /products before mounting product routers.
 */
export function productContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const segments = req.path.replace(/^\/+/, "").split("/");
  const productsIndex = segments.indexOf("products");
  const slug = productsIndex >= 0 && segments[productsIndex + 1] ? segments[productsIndex + 1] : undefined;
  if (!slug) {
    return next();
  }
  const product = getBySlug(slug);
  if (product) {
    req.productId = product.productId;
    req.productModule = product;
  }
  next();
}
