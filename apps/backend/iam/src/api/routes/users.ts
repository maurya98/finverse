import { UserController } from "../controllers/user.controller";

const userController = new UserController();
const router = userController.router;

export default router;
