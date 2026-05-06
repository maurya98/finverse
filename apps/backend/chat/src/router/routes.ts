import express, { Request, Response } from "express";
import { logger } from "@finverse/logger";
import { config } from "../config";
import { APP_CONSTANTS } from "../constants/constants";
import { InvalidRequestError, MissingFieldError } from "../errors";
import { Prisma } from "../generated/prisma/client";
import { createDashboard, getActiveDashboardRecord } from "../dashboard/dashboard.service";
import { createRawData } from "../raw-data/raw-data.service";
import type { CreateDashboardInput } from "../types/dashboard.types";
import type {
  PayloadValue,
  WebhookPayload,
  WhatsAppWebhookBody,
} from "../types/router.types";

const router = express.Router();
const routeLogger = logger.child({ route: "webhook", app: "chat" });

router.post("/message", async (req: Request, res: Response) => {
  const payload = parseWebhookPayload(req.body as WhatsAppWebhookBody);

  if (config.logging.http) routeLogger.info({ payload }, "Webhook payload mapped");

  const storedRecord = await storeWebhookPayload(payload);

  return res.status(200).json({ success: true, data: { ...payload, stored_in: storedRecord } });
});

function parseWebhookPayload(body: WhatsAppWebhookBody): WebhookPayload {
  if (!body?.entry?.length) throw new InvalidRequestError("Request body is missing");
  
  const value = body.entry[0]?.changes?.[0]?.value;
  const metadata = value?.metadata;
  const contact = value?.contacts?.[0];
  const message = value?.messages?.[0];

  if (!metadata) throw new MissingFieldError("metadata");
  
  if (!contact) throw new MissingFieldError("contact");
  
  if (!message) throw new MissingFieldError("message");
  
  return mapWebhookPayload(metadata.display_phone_number ?? null, contact, message);
}

function mapWebhookPayload(
  botNumber: string | null,
  contact: NonNullable<PayloadValue["contacts"]>[number],
  message: Record<string, unknown>
): WebhookPayload {
  return {
    bot_number: botNumber,
    bot_name: "",
    user_name: contact.profile?.name ?? null,
    user_number: contact.wa_id ?? null,
    user_message: JSON.stringify(message),
    customer_reply: "",
    created_datetime: new Date(),
    created: new Date(),
    status: APP_CONSTANTS.MSG_STATUS.OPEN,
  };
}

async function storeWebhookPayload(payload: WebhookPayload) {
  if (payload.bot_number && payload.user_number) {
    const dashboardRecord = await getActiveDashboardRecord(payload.bot_number, payload.user_number);

    if (dashboardRecord) {
      await createDashboard(mapWebhookPayloadToDashboardInput(payload));
      return "whatsapp_chat_support_dashboard";
    }
  }

  await createRawData({
    rawData: serializeWebhookPayload(payload),
    createdDatetime: payload.created_datetime,
    created: payload.created,
  });

  return "whatsapp_chat_support_raw_data";
}

function serializeWebhookPayload(payload: WebhookPayload): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue;
}

function mapWebhookPayloadToDashboardInput(payload: WebhookPayload): CreateDashboardInput {
  return {
    botNumber: payload.bot_number ? BigInt(payload.bot_number) : undefined,
    botName: payload.bot_name || undefined,
    userName: payload.user_name || undefined,
    userNumber: payload.user_number ? BigInt(payload.user_number) : undefined,
    userMessage: payload.user_message || undefined,
    customerReply: payload.customer_reply || undefined,
    createdDatetime: payload.created_datetime,
    created: payload.created,
    status: payload.status === APP_CONSTANTS.MSG_STATUS.OPEN,
  };
}

export default router;
