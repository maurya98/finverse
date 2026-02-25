# Contributing to LMS

## Adding a new product

To add a new product to the LMS backend:

1. **Define product ID and slug**
   - Open [src/products/types.ts](src/products/types.ts).
   - Add a new value to the `ProductId` enum (use the next integer; IDs must align with `product_id` in `lead_master` / `offer`).
   - Decide the URL slug (kebab-case, URL-safe), e.g. `"home-loan"`.

2. **Create the product module**
   - Create a folder under `src/products/<slug>/` (e.g. `src/products/home-loan/`).
   - Add a controller (e.g. `controllers/hl.controller.ts`) with a public `router: Router` and your routes.
   - Create `src/products/<slug>/index.ts` that implements `IProductModule`:
     - `productId`: your `ProductId` enum value
     - `slug`: the same slug string (e.g. `"home-loan"`)
     - `router`: the controller’s router
     - Optional: `name` for logging/docs

3. **Register the product**
   - Open [src/products/factory.ts](src/products/factory.ts).
   - Import your module (e.g. `import { homeLoanModule } from "./home-loan"`).
   - Call `register(homeLoanModule)` with the other products.

No changes are required in [src/routes/api.ts](src/routes/api.ts); the factory’s `mountAll` already mounts every registered product under `/api/products/<slug>/`.

## Conventions

- **One product per folder** under `src/products/<slug>/`.
- **Product ID** is numeric and stable; do not reuse or change IDs for existing products.
- **Slug** is kebab-case and must be URL-safe.
- **No cross-product imports** except shared types in `src/products/types.ts` and the factory.
- Product-specific validation, error codes, and services can live inside the product folder; document ownership (e.g. which team owns which product) in the product’s README or in this file.
