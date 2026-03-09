import { Router } from "express";
import { CustomerController } from "../controller/customer.controller";

const router: Router = Router();

const customerController = new CustomerController();
router.use("/customer", customerController.router);

export default router;