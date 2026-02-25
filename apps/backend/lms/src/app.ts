/// <reference path="./types/express.d.ts" />
import express, { Express } from "express";
import { logger } from "@finverse/logger";
import { errorHandlerMiddleware, requestLoggerMiddleware, securityMiddleware } from "@finverse/middlewares";
import apiRouter from "./routes/api";

const app: Express = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLoggerMiddleware);
app.use(securityMiddleware);
app.use(errorHandlerMiddleware);
app.use(apiRouter);

app.listen(process.env.PORT ?? 3002, () => {
  logger.info(`LMS server is running on port ${process.env.PORT ?? 3002}`);
});

export default app;