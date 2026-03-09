import { Router } from "express";
import { ClientAppController, ClientPermissionController, DataExportController, InternalServiceController, RouteServiceController } from "../controllers";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";

const router: Router = Router();

// All admin routes require authentication
router.use(authMiddleware);

// API Endpoints - Most require ADMIN role for write operations
router.use("/applications", new ClientAppController().router);
router.use("/services", new InternalServiceController().router);
router.use("/permissions", new ClientPermissionController().router);
router.use("/routes", new RouteServiceController().router);

// Data export requires ADMIN role
router.use("/export", requireAdmin, new DataExportController().router);

export default router;
