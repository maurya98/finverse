import bcrypt from "bcrypt";
import { prisma } from "../../databases/client.js";

export const USER_ROLES = ["ADMIN", "MAINTAINER", "DEVELOPER", "VIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** User payload returned by service (no password hash). */
export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

function toSafeUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserService {
  constructor() {}

  async findAll(skip = 0, take = 50): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      skip,
      take,
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });
    return users.map(toSafeUser);
  }

  async findById(id: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    return user ? toSafeUser(user) : null;
  }

  async create(data: {
    email: string;
    password: string;
    name?: string | null;
    role?: UserRole;
  }): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const email = data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("User with this email already exists");
    }
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: data.name ?? null,
        role: (data.role ?? "DEVELOPER") as "ADMIN" | "MAINTAINER" | "DEVELOPER" | "VIEWER",
      },
      select: userSelect,
    });
    return toSafeUser(user);
  }

  async update(
    id: string,
    data: { name?: string | null; role?: UserRole }
  ): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role as "ADMIN" | "MAINTAINER" | "DEVELOPER" | "VIEWER" }),
      },
      select: userSelect,
    });
    return toSafeUser(updated);
  }

  async delete(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return false;
    await prisma.user.delete({ where: { id } });
    return true;
  }
}
