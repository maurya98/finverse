import express from "express";
import { logger } from "@finverse/logger";
import { requestLoggerMiddleware, securityMiddleware } from "@finverse/middlewares";
import apiRouter from "./api/routes/api";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(requestLoggerMiddleware({ appName: "ruleenginebe" }));
app.use(...securityMiddleware);
app.use(apiRouter);

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});