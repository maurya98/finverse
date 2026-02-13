import { Request, Response, Router } from "express";
import { loginSchema } from "../validations/auth.validator";
import { validateBody } from "@finverse/utils";

export class AuthController {

    public router: Router;
    
    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post("/login", validateBody(loginSchema), this.login.bind(this));
    }

    private login(req: Request, res: Response): Response<any, Record<string, any>> {
        const { email, password } = req.body;
        return res.status(200).json({ message: "Login successful" });
    }
}