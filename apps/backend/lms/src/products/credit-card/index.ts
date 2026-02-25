import { ProductId } from "../types";
import CreditCardController from "./controllers/cc.controller";

const controller = new CreditCardController();

export const creditCardModule = {
  productId: ProductId.CREDIT_CARD,
  slug: "creditcard",
  router: controller.router,
  name: "Credit Card",
};
