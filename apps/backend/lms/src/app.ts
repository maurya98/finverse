import express, { Express } from "express";
import dotenv from "dotenv";
import { logger } from "@finverse/logger";
import routes from "./api/routes";
import { requestLoggerMiddleware, securityMiddleware } from "@finverse/middlewares";
dotenv.config();

const app: Express = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLoggerMiddleware);
app.use(securityMiddleware);
app.use(routes);


app.listen(process.env.PORT!, () => {
    logger.info(`LMS server is running on port ${process.env.PORT!}`);
});

export default app;