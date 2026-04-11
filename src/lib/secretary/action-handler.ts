import { ParsedIntent } from "@/lib/line-bot/intent-parser";
import { createEvent, listEvents } from "@/lib/line-bot/calendar";
import { createTask, listTasks, completeTask } from "@/lib/line-bot/tasks";
import { saveMemo, searchMemos, listRecentMemos, deleteMemo } from "@/lib/line-bot/memos";
import { generateBriefing } from "@/lib/line-bot/formatter";

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

export async function handleParsedIntent(
  intent: ParsedIntent,
  originalText: string
): Promise<string> {
  switch (intent.intent) {
    case "calendar_create": {
      const { title, date, startTime, endTime } = intent.params;
      if (!title || !date || !startTime) {
        return "予定の登録に必要な情報が不足しています。\n例: 「明日14時に○○と打ち合わせ」";
      }
      const end = endTime || addHours(startTime, 1);
      return await createEvent({ title, date, startTime, endTime: end });
    }

    case "calendar_list": {
      const date = intent.params.date || getTodayDateString();
      return await listEvents(date);
    }

    case "task_create": {
      const taskTitle = intent.params.taskTitle || intent.params.title || originalText;
      const priority = intent.params.priority || "normal";
      const dueDate = intent.params.date;
      return await createTask(taskTitle, priority, dueDate);
    }

    case "task_list": {
      return await listTasks();
    }

    case "task_done": {
      const query = intent.params.taskTitle || intent.params.title || originalText;
      return await completeTask(query);
    }

    case "memo_save": {
      const content = intent.params.message || originalText;
      return await saveMemo(content);
    }

    case "memo_search": {
      const query = intent.params.message || originalText;
      return await searchMemos(query);
    }

    case "memo_list": {
      return await listRecentMemos();
    }

    case "memo_delete": {
      const q = intent.params.message || originalText;
      return await deleteMemo(q);
    }

    case "briefing": {
      return await generateBriefing();
    }

    case "general":
    default: {
      return (
        intent.params.message ||
        "了解しました。\n\n使い方:\n📅 予定登録: 「明日14時に○○」\n📋 タスク追加: 「○○をタスクに追加」\n📝 タスク一覧: 「タスク一覧」\n✅ タスク完了: 「○○完了」\n📊 ブリーフィング: 「おはよう」"
      );
    }
  }
}
