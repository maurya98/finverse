import { Router } from "express";
import { AuthController, UserController } from "../controllers";

const router: Router = Router();

// Auth Routes
const authController = new AuthController();
router.use("/auth", authController.router);

// User Routes
const userController = new UserController();
router.use("/users", userController.router);

export default router;
