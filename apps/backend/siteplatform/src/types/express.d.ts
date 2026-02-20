declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        type?: 'user' | 'application';
      };
    }
  }
}

export {};