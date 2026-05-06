export type WhatsAppWebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: {
          display_phone_number?: string;
        };
        contacts?: Array<{
          profile?: {
            name?: string;
          };
          wa_id?: string;
        }>;
        messages?: Array<Record<string, unknown>>;
      };
    }>;
  }>;
};

export type WebhookPayload = {
  bot_number: string | null;
  bot_name: string;
  user_name: string | null;
  user_number: string | null;
  user_message: string;
  customer_reply: string;
  created_datetime: Date;
  created: Date;
  status: number;
};

export type PayloadValue = NonNullable<
  NonNullable<NonNullable<WhatsAppWebhookBody["entry"]>[number]["changes"]>[number]["value"]
>;
