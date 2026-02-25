import type { ProductId } from "../products/types";
import type { IProductModule } from "../products/types";

declare global {
  namespace Express {
    interface Request {
      /** Set by product middleware when route is under /api/products/:slug */
      productId?: ProductId;
      /** Set by product middleware when route is under /api/products/:slug */
      productModule?: IProductModule;
    }
  }
}

export {};
