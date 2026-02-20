import { logger } from "@finverse/logger";
import { requestLoggerMiddleware, securityMiddleware } from "@finverse/middlewares";
import express, { Request, Response } from "express";
import { gatewayMiddleware } from "./api/middlewares/gateway.middleware";
import apiRouter from "./api/routes/api";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(requestLoggerMiddleware({ appName: "site-platform" }));
app.use(...securityMiddleware);

// Health Check Endpoint
app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "ok", message: "Site Platform is running" });
});

// Admin Routes
app.use("/api/admin", apiRouter);

// Catch-all for all other routes (Gateway)
app.use("/", gatewayMiddleware);


// Start the application
app.listen(3001, () => {
  logger.info("Site Platform server is running on port 3001");
});
