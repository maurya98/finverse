declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'ADMIN' | 'MAINTAINER' | 'USER';
        isActive: boolean;
      };
      session?: {
        id: string;
        token: string;
        userId: string;
        expiresAt: Date;
      };
      sessionToken?: string;
    }
  }
}

export {};
