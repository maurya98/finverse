import express from "express";
import { logger } from "@finverse/logger";
import { requestLoggerMiddleware, requestLoggerRoutes, securityMiddleware } from "@finverse/middlewares";
import apiRouter from "./api/routes/api";

const app = express();

process.env.DB_URL = process.env.DATABASE_URL;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(...securityMiddleware);
app.use("/api/v1/logs", requestLoggerRoutes());
app.use(requestLoggerMiddleware({ appName: "ruleenginebe" }));
app.use(apiRouter);

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});