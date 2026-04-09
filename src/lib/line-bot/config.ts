import { messagingApi } from "@line/bot-sdk";

export const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

let clientInstance: messagingApi.MessagingApiClient | null = null;

export function getLineClient(): messagingApi.MessagingApiClient {
  if (!clientInstance) {
    clientInstance = new messagingApi.MessagingApiClient({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
    });
  }
  return clientInstance;
}

export const OWNER_LINE_USER_ID = process.env.LINE_OWNER_USER_ID || "";
