import express, { Express } from "express";
import { requestLoggerMiddleware, requestLoggerRoutes, securityMiddleware } from "@finverse/middlewares";
import { logger } from "@finverse/logger";
import apiRouter from "./routes/api";

const app: Express = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/v1/logs", requestLoggerRoutes());
app.use(requestLoggerMiddleware({ appName: "customer" }));
app.use(apiRouter);

const PORT = process.env.PORT ?? 5000;
const server = app.listen(PORT, () => {
    logger.info(`Customer service is running on port ${process.env.PORT} with Environment: ${process.env.NODE_ENV}`);
});

server.on("error", (err: Error) => {
    logger.error({ err }, "Server error");
    process.exit(1);
});

export default server;