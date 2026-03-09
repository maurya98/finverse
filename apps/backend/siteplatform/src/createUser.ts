import "dotenv/config";
import { AuthService } from "./api/services/auth.service";
import { logger } from "@finverse/logger";

/**
 * Script to create a test user
 * Usage: npx ts-node src/createUser.ts
 */
async function createTestUser() {
  const authService = new AuthService();

  const email = process.env.TEST_USER_EMAIL || "admin@example.com";
  const password = process.env.TEST_USER_PASSWORD || "password123";

  try {
    const user = await authService.createUser(email, password);
    logger.info(`User created successfully: ${user.email}`);
    logger.info(`Use these credentials to login:`);
    logger.info(`Email: ${email}`);
    logger.info(`Password: ${password}`);
    process.exit(0);
  } catch (error: any) {
    if (error.code === "P2002") {
      logger.error(`User with email ${email} already exists`);
    } else {
      logger.error("Error creating user:", error);
    }
    process.exit(1);
  }
}

createTestUser();
