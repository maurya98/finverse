import { Router } from "express";
import { ClientAppController, ClientPermissionController, InternalServiceController, RouteServiceController } from "../controllers";

const router: Router = Router();

// API Endpoints
router.use("/applications", new ClientAppController().router);
router.use("/services", new InternalServiceController().router);
router.use("/permissions", new ClientPermissionController().router);
router.use("/routes", new RouteServiceController().router);

export default router;
