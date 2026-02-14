import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers.js";
import { BlobsController } from "../controllers/blobs.controller.js";
import { BranchesController } from "../controllers/branches.controller.js";
import { CommitsController } from "../controllers/commits.controller.js";
import { MergeRequestsController } from "../controllers/merge-requests.controller.js";
import { RepositoriesController } from "../controllers/repositories.controller.js";
import { TreesController } from "../controllers/trees.controller.js";
import { UsersController } from "../controllers/users.controller.js";
import { WorkspacesController } from "../controllers/workspaces.controller.js";

const router: Router = Router();

// Root route so GET / returns 200 (e.g. health check / verify server is up)
router.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Rule Engine API",
    endpoints: [
      "/auth/login",
      "/auth/logout",
      "/users",
      "/blobs",
      "/branches",
      "/commits",
      "/merge-requests",
      "/trees",
    ],
  });
});

router.use("/auth/", new AuthController().router);
router.use("/blobs/", new BlobsController().router);
router.use("/branches/", new BranchesController().router);
router.use("/commits/", new CommitsController().router);
router.use("/merge-requests/", new MergeRequestsController().router);
router.use("/repositories/", new RepositoriesController().router);
router.use("/trees/", new TreesController().router);
router.use("/users/", new UsersController().router);
router.use("/workspaces/", new WorkspacesController().router);

export default router;