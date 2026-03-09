import "dotenv/config";
import express, { Express } from "express";
import { logger } from "@finverse/logger";
import { requestLoggerMiddleware, requestLoggerRoutes } from "@finverse/middlewares";
import apiRouter from "./api/routes/api";

const app: Express = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api/v1/logs", requestLoggerRoutes());
app.use(requestLoggerMiddleware({ appName: "ruleenginebe" }));
app.use(apiRouter);

const PORT = process.env.PORT ?? 5000;
const server = app.listen(PORT, () => {
  logger.info(`Rule Engine Backend is running on port ${PORT} with Environment: ${process.env.NODE_ENV}`);
});

// Keep the process alive and handle graceful shutdown
server.on("error", (err: Error) => {
  logger.error({ err }, "Server error");
  process.exit(1);
});