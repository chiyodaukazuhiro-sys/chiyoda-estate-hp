import { listEvents } from "./calendar";
import { getTaskSummary } from "./tasks";

export async function generateBriefing(): Promise<string> {
  const now = new Date();
  const todayStr = now.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  const today = now
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");

  const tomorrow = new Date(now.getTime() + 86400000)
    .toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");

  // Fetch data in parallel
  const [todayEvents, tomorrowEvents, taskSummary] = await Promise.all([
    listEvents(today).catch(() => "取得できませんでした"),
    listEvents(tomorrow).catch(() => ""),
    getTaskSummary().catch(() => ({ total: 0, urgent: 0, important: 0 })),
  ]);

  let briefing = `━━━━━━━━━━━━━━━━━\nおはようございます\n${todayStr}\n━━━━━━━━━━━━━━━━━\n\n`;

  // Today's schedule
  briefing += todayEvents + "\n\n";

  // Tomorrow preview (abbreviated)
  if (tomorrowEvents && !tomorrowEvents.includes("予定はありません")) {
    const lines = tomorrowEvents.split("\n").slice(2, 4); // Skip header, show max 2
    if (lines.length > 0) {
      briefing += `📌 明日の予定:\n${lines.join("\n")}\n\n`;
    }
  }

  // Task summary
  if (taskSummary.total > 0) {
    briefing += `📋 タスク: ${taskSummary.total}件`;
    if (taskSummary.urgent > 0) briefing += `（🔴緊急${taskSummary.urgent}件）`;
    if (taskSummary.important > 0)
      briefing += `（🟡重要${taskSummary.important}件）`;
    briefing += "\n";
  } else {
    briefing += "📋 未完了タスクなし ✓\n";
  }

  briefing += "\n💬 予定登録・タスク追加はこのチャットで！";

  return briefing;
}
