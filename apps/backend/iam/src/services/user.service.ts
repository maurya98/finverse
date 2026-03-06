import { logger } from "@finverse/logger";
import { prisma } from "../databases/client";
import bcrypt from "bcryptjs";
import { Role } from "../databases/generated/prisma";

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserListParams extends PaginationParams {
  search?: string;
  role?: Role;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async createUser(input: CreateUserInput) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role || Role.USER,
        },
      });

      logger.info({ userId: user.id, email: user.email }, "User created successfully");

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error({ error, email: input.email }, "Create user failed");
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error({ error, userId }, "Get user failed");
      throw error;
    }
  }

  async getAllUsers(params: UserListParams = {}) {
    try {
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(100, params.limit || 10);
      const skip = (page - 1) * limit;
      const sortBy = params.sortBy || "createdAt";
      const sortOrder = params.sortOrder || "desc";

      // Build where clause
      const where: Record<string, unknown> = {};
      if (params.search) {
        where.OR = [
          { email: { contains: params.search, mode: "insensitive" } },
          { name: { contains: params.search, mode: "insensitive" } },
        ];
      }
      if (params.role) {
        where.role = params.role;
      }
      if (params.isActive !== undefined) {
        where.isActive = params.isActive;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error({ error }, "Get all users failed");
      throw error;
    }
  }

  async updateUser(userId: string, input: UpdateUserInput) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check if email is being changed to one that already exists
      if (input.email && input.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: input.email },
        });
        if (existingUser) {
          throw new Error("Email already in use");
        }
      }

      const updateData: Record<string, unknown> = {};
      if (input.email) updateData.email = input.email;
      if (input.name) updateData.name = input.name;
      if (input.role) updateData.role = input.role;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      logger.info({ userId }, "User updated successfully");

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      logger.error({ error, userId }, "Update user failed");
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Delete associated sessions first
      await prisma.session.deleteMany({
        where: { userId },
      });

      // Delete user
      await prisma.user.delete({
        where: { id: userId },
      });

      logger.info({ userId }, "User deleted successfully");
      return true;
    } catch (error) {
      logger.error({ error, userId }, "Delete user failed");
      throw error;
    }
  }

  async bulkCreateUsers(users: CreateUserInput[]) {
    try {
      const results = [];

      for (const userInput of users) {
        try {
          const user = await this.createUser(userInput);
          results.push({ success: true, data: user });
        } catch (error) {
          results.push({
            success: false,
            email: userInput.email,
            error: (error as Error).message,
          });
        }
      }

      logger.info({ count: results.length }, "Bulk create users completed");
      return results;
    } catch (error) {
      logger.error({ error }, "Bulk create users failed");
      throw error;
    }
  }

  async bulkUpdateUsers(
    updates: Array<{ id: string; data: UpdateUserInput }>
  ) {
    try {
      const results = [];

      for (const update of updates) {
        try {
          const user = await this.updateUser(update.id, update.data);
          results.push({ success: true, data: user });
        } catch (error) {
          results.push({
            success: false,
            userId: update.id,
            error: (error as Error).message,
          });
        }
      }

      logger.info({ count: results.length }, "Bulk update users completed");
      return results;
    } catch (error) {
      logger.error({ error }, "Bulk update users failed");
      throw error;
    }
  }

  async bulkDeleteUsers(userIds: string[]) {
    try {
      const results = [];

      for (const userId of userIds) {
        try {
          await this.deleteUser(userId);
          results.push({ success: true, userId });
        } catch (error) {
          results.push({
            success: false,
            userId,
            error: (error as Error).message,
          });
        }
      }

      logger.info({ count: results.length }, "Bulk delete users completed");
      return results;
    } catch (error) {
      logger.error({ error }, "Bulk delete users failed");
      throw error;
    }
  }

  async toggleUserStatus(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
      });

      logger.info({ userId, newStatus: updatedUser.isActive }, "User status toggled");

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      };
    } catch (error) {
      logger.error({ error, userId }, "Toggle user status failed");
      throw error;
    }
  }

  async getUsersByRole(role: Role, params: PaginationParams = {}) {
    try {
      return this.getAllUsers({
        ...params,
        role,
      });
    } catch (error) {
      logger.error({ error, role }, "Get users by role failed");
      throw error;
    }
  }

  async searchUsers(query: string, params: PaginationParams = {}) {
    try {
      return this.getAllUsers({
        ...params,
        search: query,
      });
    } catch (error) {
      logger.error({ error, query }, "Search users failed");
      throw error;
    }
  }
}

export default UserService;
