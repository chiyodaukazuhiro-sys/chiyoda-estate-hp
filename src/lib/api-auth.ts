import { NextRequest } from "next/server";

export function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const secret = process.env.API_SECRET_KEY;
  if (!secret) return false;
  return apiKey === secret;
}
