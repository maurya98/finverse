import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
      };
      session?: {
        id: string;
        token: string;
        userId: string;
        expiresAt: Date;
      };
      sessionToken?: string;
      cookies?: Record<string, string>;
    }
  }
}
