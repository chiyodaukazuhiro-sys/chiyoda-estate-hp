import { google } from "googleapis";
import { prisma } from "@/lib/db";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
      "https://chiyoda-estate-hp.vercel.app/api/auth/google/callback"
  );
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/tasks"],
  });
}

export async function handleCallback(code: string): Promise<void> {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  await prisma.oAuthToken.upsert({
    where: { id: "google-tasks" },
    create: {
      id: "google-tasks",
      accessToken: tokens.access_token || "",
      refreshToken: tokens.refresh_token || "",
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
    },
    update: {
      accessToken: tokens.access_token || "",
      refreshToken: tokens.refresh_token || tokens.refresh_token || "",
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
    },
  });
}

async function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client();

  const token = await prisma.oAuthToken.findUnique({
    where: { id: "google-tasks" },
  });

  if (!token) {
    throw new Error("Google Tasks未連携。秘書アプリから連携してください。");
  }

  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiresAt.getTime(),
  });

  // Auto-refresh if expired
  if (token.expiresAt.getTime() < Date.now()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await prisma.oAuthToken.update({
      where: { id: "google-tasks" },
      data: {
        accessToken: credentials.access_token || "",
        expiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
      },
    });
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

export async function isConnected(): Promise<boolean> {
  try {
    const token = await prisma.oAuthToken.findUnique({
      where: { id: "google-tasks" },
    });
    return !!token;
  } catch {
    return false;
  }
}

export async function createGoogleTask(
  title: string,
  notes?: string,
  dueDate?: string
): Promise<string> {
  const auth = await getAuthenticatedClient();
  const tasks = google.tasks({ version: "v1", auth });

  const requestBody: { title: string; notes?: string; due?: string } = { title };
  if (notes) requestBody.notes = notes;
  if (dueDate) requestBody.due = `${dueDate}T00:00:00.000Z`;

  const res = await tasks.tasks.insert({
    tasklist: "@default",
    requestBody,
  });

  return `✅ Googleタスクに追加\n📋 ${res.data.title}${dueDate ? `\n📅 ${dueDate}` : ""}`;
}

export async function listGoogleTasks(): Promise<string> {
  const auth = await getAuthenticatedClient();
  const tasks = google.tasks({ version: "v1", auth });

  const res = await tasks.tasks.list({
    tasklist: "@default",
    showCompleted: false,
    maxResults: 20,
  });

  const items = res.data.items || [];

  if (items.length === 0) {
    return "📋 Googleタスク\n\n未完了タスクなし ✓";
  }

  let result = `📋 Googleタスク（${items.length}件）\n\n`;
  for (const task of items) {
    const due = task.due
      ? new Date(task.due).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
      : "";
    result += `⬜ ${task.title}${due ? ` (${due}まで)` : ""}\n`;
  }

  return result.trim();
}

export async function completeGoogleTask(titleQuery: string): Promise<string> {
  const auth = await getAuthenticatedClient();
  const tasks = google.tasks({ version: "v1", auth });

  const res = await tasks.tasks.list({
    tasklist: "@default",
    showCompleted: false,
  });

  const items = res.data.items || [];
  const match = items.find((t) =>
    t.title?.toLowerCase().includes(titleQuery.toLowerCase())
  );

  if (!match || !match.id) {
    return `❌ 「${titleQuery}」に一致するタスクが見つかりません`;
  }

  await tasks.tasks.update({
    tasklist: "@default",
    task: match.id,
    requestBody: { ...match, status: "completed" },
  });

  return `✅ 完了にしました\n📋 ${match.title}`;
}
