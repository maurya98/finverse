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
      sessionToken?: string;
    }
  }
}

export {};
