import { Router } from "express";
import { mountAll } from "../products/factory";
import { productContextMiddleware } from "../middlewares/product-context.middleware";

const router: Router = Router();

router.use(productContextMiddleware);
mountAll(router);

export default router;  