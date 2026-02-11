import express from "express";
import { logger } from "@finverse/logger";
import { securityMiddleware } from "@finverse/middlewares";
import apiRouter from "./routes/api";

const app = express();

app.use(express.json());
app.use(securityMiddleware);
app.use(apiRouter);

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});