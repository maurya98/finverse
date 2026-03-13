/// <reference path="./types/express.d.ts" />
import express, { Express } from "express";
import { logger } from "@finverse/logger";
import { errorHandlerMiddleware, requestLoggerMiddleware, requestLoggerRoutes } from "@finverse/middlewares";
import apiRouter from "./routes/api";

const app: Express = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/v1/logs", requestLoggerRoutes());
app.use(requestLoggerMiddleware({ appName: "lms" }));
app.use(errorHandlerMiddleware);
app.use(apiRouter);

app.listen(process.env.PORT ?? 5003, () => {
  logger.info(`LMS is running on port ${process.env.PORT} with Environment: ${process.env.NODE_ENV}`);
});

export default app;