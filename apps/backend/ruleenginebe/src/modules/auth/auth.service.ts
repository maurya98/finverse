import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../databases/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

/** In-memory set of revoked tokens (for logout). Use Redis/DB in production for multi-instance. */
const revokedTokens = new Set<string>();

export class AuthService {
  constructor() {}

  /**
   * Login: find user by email, verify password, return JWT.
   * @throws Error with message "Invalid email or password" on failure
   */
  public async login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; name: string | null; role: string } }> {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Logout: revoke the given token so it can no longer be used.
   * Client should send the token (e.g. in Authorization header or body) and then discard it.
   */
  public async logout(token: string): Promise<void> {
    const trimmed = token?.trim();
    if (trimmed) {
      revokedTokens.add(trimmed);
    }
  }

  /**
   * Check if a token has been revoked (e.g. after logout).
   * Use this in auth middleware to reject revoked tokens.
   */
  public isTokenRevoked(token: string): boolean {
    return revokedTokens.has(token.trim());
  }

  /**
   * Verify JWT and return payload (sub = user id, role).
   * Returns null if token is missing, invalid, expired, or revoked.
   */
  public verifyToken(token: string): { sub: string; role: string } | null {
    const trimmed = token?.trim();
    if (!trimmed || this.isTokenRevoked(trimmed)) return null;
    try {
      const payload = jwt.verify(trimmed, JWT_SECRET) as { sub?: string; role?: string };
      if (payload?.sub && payload?.role) return { sub: payload.sub, role: payload.role };
    } catch {
      // invalid or expired
    }
    return null;
  }
}
