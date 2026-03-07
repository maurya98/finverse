import { logger } from "@finverse/logger";
import { requestLoggerMiddleware, securityMiddleware } from "@finverse/middlewares";
import express, { Request, Response } from "express";
import cookieParser from "cookie";
import apiRouter from "./api/routes/api";

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Custom cookie parser middleware
app.use((req: Request, res: Response, next) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    req.cookies = cookieParser.parse(cookieHeader);
  } else {
    req.cookies = {};
  }
  next();
});

app.use(requestLoggerMiddleware({ appName: "iam" }));
app.use(...securityMiddleware);

// Health Check Endpoint
app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "ok", message: "IAM service is running" });
});

// API Routes
app.use("/api", apiRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  logger.error({ error: err }, "Unhandled error");
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start the application
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  logger.info(`IAM service is running on port ${PORT}`);
});
