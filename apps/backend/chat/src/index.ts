import express from "express";
import { logger } from "@finverse/logger";
import router from "./router/routes";
import { config } from "./config";
import { HealthRoute } from "./health/health.route";
import { DatabaseClient } from "./db/db";
import { CacheClient } from "./cache/cache";
import { errorMiddleware } from "./middleware/error.middleware";

// Initialize Express App
const app = express();
const appLogger = logger.child({ app: "chat" });

// Middlewares
app.use(express.json());

// Handle Connections
CacheClient.initialize();
DatabaseClient.initialize();

// Health Checks
HealthRoute.register(app);

// API Router
app.use("/api/v1", router);

// Error Handling
app.use(errorMiddleware);

// Monitor incoming requests
app.listen(config.server.port, () => {
  if (config.logging.startup) {
    appLogger.info({ port: config.server.port, environment: process.env.NODE_ENV }, "Chat server started");
  }
});
