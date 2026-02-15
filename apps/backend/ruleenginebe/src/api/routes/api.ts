import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";
import { BlobsController } from "../controllers/blobs.controller";
import { BranchesController } from "../controllers/branches.controller";
import { CommitsController } from "../controllers/commits.controller";
import { MergeRequestsController } from "../controllers/merge-requests.controller";
import { RepositoriesController } from "../controllers/repositories.controller";
import { ExecuteController } from "../controllers/execute.controller";
import { SimulateController } from "../controllers/simulate.controller";
import { TreesController } from "../controllers/trees.controller";
import { UsersController } from "../controllers/users.controller";
import { WorkspacesController } from "../controllers/workspaces.controller";

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
      "/execute",
      "/simulate",
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
router.use("/execute/", new ExecuteController().router);
router.use("/simulate/", new SimulateController().router);
router.use("/trees/", new TreesController().router);
router.use("/users/", new UsersController().router);
router.use("/workspaces/", new WorkspacesController().router);

export default router;