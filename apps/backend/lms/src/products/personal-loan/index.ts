import { ProductId } from "../types";
import PersonalLoanController from "./controllers/pl.controller";

const controller = new PersonalLoanController();

export const personalLoanModule = {
  productId: ProductId.PERSONAL_LOAN,
  slug: "personalloan",
  router: controller.router,
  name: "Personal Loan",
};
