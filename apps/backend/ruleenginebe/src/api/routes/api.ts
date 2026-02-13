import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";

const router: Router = Router();

router.use("auth/", new AuthController().router);
router.use("blobs/");
router.use("branches/");
router.use("commits/");
router.use("merge-requests/");
router.use("repositories/");
router.use("trees/");
router.use("users/");

export default router;