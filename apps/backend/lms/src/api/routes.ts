import { Router } from "express";
import { CreditCardController } from "../products/creditcard/controllers/cc.controller";

const router: Router = Router();
const creditCardController = new CreditCardController();

router.use("/creditcard", creditCardController.router);

export default router;