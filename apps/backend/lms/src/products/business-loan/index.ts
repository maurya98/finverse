import { ProductId } from "../types";
import BusinessLoanController from "./controllers/bl.controller";

const controller = new BusinessLoanController();

export const businessLoanModule = {
  productId: ProductId.BUSINESS_LOAN,
  slug: "businessloan",
  router: controller.router,
  name: "Business Loan",
};
