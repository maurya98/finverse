import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { logger } from "@finverse/logger";
import { requestLoggerMiddleware, requestLoggerRoutes } from "@finverse/middlewares";
import apiRouter from "./api/routes/api";

const app: Express = express();

// CORS: allow frontend origin so browser allows cross-origin requests (e.g. login from Vite dev server)
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ?? true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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