import { logger } from "@finverse/logger";
import { requestLoggerMiddleware, requestLoggerRoutes, securityMiddleware } from "@finverse/middlewares";
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { gatewayMiddleware } from "./api/middlewares/gateway.middleware";
import apiRouter from "./api/routes/api";
import { prisma } from "./databases/client";

const app: Express = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser()); // Parse cookies for authentication
app.use(requestLoggerMiddleware({ appName: "site-platform" }));
app.use(...securityMiddleware);
app.use("/v1/api/logs", requestLoggerRoutes());  
app.use(requestLoggerMiddleware({ appName: "siteplatform" }));

// Health Check Endpoint
app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "ok", message: "Site Platform is running" });
});

// Admin Routes (protected with authentication)
app.use("/api/admin", apiRouter);

// Catch-all for all other routes (Gateway)
app.use("/", gatewayMiddleware);

async function start(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Database connection established");
  } catch (err) {
    const url = process.env.DATABASE_URL ?? "";
    const safeUrl = url.replace(/:[^:@]+@/, ":****@");
    logger.error(
      { err, DATABASE_URL: safeUrl },
      "Cannot connect to database. Check that PostgreSQL is running and DATABASE_URL is correct (host, port, database name)."
    );
    process.exit(1);
  }

  const port = Number(process.env.PORT) || 5001;
  app.listen(port, () => {
    logger.info(`Site Platform is running on port ${port} with Environment: ${process.env.NODE_ENV}`);
  });
}

start();
