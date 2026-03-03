import { ProductId } from "../types";

/** Credit card product ID for lead_master.product_id */
export const CREDIT_CARD_PRODUCT_ID = ProductId.CREDIT_CARD;

/** Stage order: each key leads to the next. "offer_creation" is terminal. */
export const STAGE_FLOW: Record<string, string> = {
  initiated: "customer_details",
  customer_details: "address_details",
  address_details: "pan_verification",
  pan_verification: "employment_details",
  employment_details: "offer_creation",
  offer_creation: "offer_creation",
};
