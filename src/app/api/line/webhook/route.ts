import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getLineClient, OWNER_LINE_USER_ID } from "@/lib/line-bot/config";
import { parseIntent } from "@/lib/line-bot/intent-parser";
import { createEvent, listEvents } from "@/lib/line-bot/calendar";
import { createTask, listTasks, completeTask } from "@/lib/line-bot/tasks";
import { saveMemo, searchMemos, listRecentMemos, deleteMemo } from "@/lib/line-bot/memos";
import { generateBriefing } from "@/lib/line-bot/formatter";

function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || "";
  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

async function handleMessage(
  replyToken: string,
  userId: string,
  text: string
): Promise<void> {
  const client = getLineClient();

  // Only allow owner
  if (OWNER_LINE_USER_ID && userId !== OWNER_LINE_USER_ID) {
    await client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "このBotは管理者専用です。" }],
    });
    return;
  }

  let replyText: string;

  try {
    const parsed = await parseIntent(text);

    switch (parsed.intent) {
      case "calendar_create": {
        const { title, date, startTime, endTime } = parsed.params;
        if (!title || !date || !startTime) {
          replyText =
            "予定の登録に必要な情報が不足しています。\n例: 「明日14時に○○と打ち合わせ」";
          break;
        }
        const end = endTime || addHours(startTime, 1);
        replyText = await createEvent({ title, date, startTime, endTime: end });
        break;
      }

      case "calendar_list": {
        const date =
          parsed.params.date || getTodayDateString();
        replyText = await listEvents(date, parsed.params.endDate);
        break;
      }

      case "task_create": {
        const taskTitle = parsed.params.taskTitle || parsed.params.title || text;
        const priority = parsed.params.priority || "normal";
        const dueDate = parsed.params.date;
        replyText = await createTask(taskTitle, priority, dueDate);
        break;
      }

      case "task_list": {
        replyText = await listTasks();
        break;
      }

      case "task_done": {
        const query = parsed.params.taskTitle || parsed.params.title || text;
        replyText = await completeTask(query);
        break;
      }

      case "memo_save": {
        const content = parsed.params.message || text;
        replyText = await saveMemo(content);
        break;
      }

      case "memo_search": {
        const query = parsed.params.message || text;
        replyText = await searchMemos(query);
        break;
      }

      case "memo_list": {
        replyText = await listRecentMemos();
        break;
      }

      case "memo_delete": {
        const q = parsed.params.message || text;
        replyText = await deleteMemo(q);
        break;
      }

      case "briefing": {
        replyText = await generateBriefing();
        break;
      }

      case "general":
      default: {
        replyText =
          parsed.params.message ||
          "了解しました。\n\n使い方:\n📅 予定登録: 「明日14時に○○」\n📋 タスク追加: 「○○をタスクに追加」\n📝 タスク一覧: 「タスク一覧」\n✅ タスク完了: 「○○完了」\n📊 ブリーフィング: 「おはよう」";
        break;
      }
    }
  } catch (error) {
    console.error("Error handling message:", error);
    replyText = "エラーが発生しました。もう一度お試しください。";
  }

  await client.replyMessage({
    replyToken,
    messages: [{ type: "text", text: replyText }],
  });
}

function getTodayDateString(): string {
  const now = new Date();
  return now
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const newH = (h + hours) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature") || "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const parsed = JSON.parse(body);
  const events = parsed.events || [];

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      await handleMessage(
        event.replyToken,
        event.source.userId,
        event.message.text
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: "LINE Bot webhook is active" });
}
