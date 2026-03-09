import "dotenv/config";
import { logger } from "@finverse/logger";

/**
 * Script to create a test user via the IAM service.
 * Usage: npx ts-node src/createUser.ts
 * Requires the IAM service to be running and IAM_BASE_URL to be set.
 */
async function createTestUser() {
  const iamBaseUrl = process.env.IAM_BASE_URL || "http://localhost:3000";
  const email = process.env.TEST_USER_EMAIL || "admin@example.com";
  const password = process.env.TEST_USER_PASSWORD || "password123";
  const name = process.env.TEST_USER_NAME || "Admin User";

  try {
    const response = await fetch(`${iamBaseUrl}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json() as { data?: { user?: { email: string } }; message?: string };

    if (!response.ok) {
      throw new Error(data.message ?? `HTTP ${response.status}`);
    }

    logger.info(`User created successfully: ${data.data?.user?.email}`);
    logger.info(`Use these credentials to login:`);
    logger.info(`Email: ${email}`);
    logger.info(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("already exists")) {
      logger.error(`User with email ${email} already exists`);
    } else {
      logger.error({ message }, "Error creating user");
    }
    process.exit(1);
  }
}

createTestUser();
