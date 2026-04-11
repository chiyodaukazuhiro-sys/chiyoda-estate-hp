import { google, calendar_v3 } from "googleapis";

function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

const PRIMARY_CALENDAR = process.env.GMAIL_USER || "primary";

// 複数カレンダーを取得（環境変数またはデフォルト）
function getCalendarIds(): string[] {
  if (process.env.GOOGLE_CALENDAR_IDS) {
    return process.env.GOOGLE_CALENDAR_IDS.split(",").map((s) => s.trim());
  }
  return [PRIMARY_CALENDAR];
}

export async function createEvent(params: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}): Promise<string> {
  const calendar = getCalendarClient();

  const startDateTime = `${params.date}T${params.startTime}:00`;
  const endDateTime = `${params.date}T${params.endTime}:00`;

  await calendar.events.insert({
    calendarId: PRIMARY_CALENDAR,
    requestBody: {
      summary: params.title,
      start: { dateTime: startDateTime, timeZone: "Asia/Tokyo" },
      end: { dateTime: endDateTime, timeZone: "Asia/Tokyo" },
    },
  });

  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const dateStr = start.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const startStr = start.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endStr = end.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `✅ 予定を登録しました\n📅 ${dateStr} ${startStr}-${endStr}\n📝 ${params.title}`;
}

export async function listEvents(date: string, endDate?: string): Promise<string> {
  const calendar = getCalendarClient();
  const calendarIds = getCalendarIds();

  const timeMin = `${date}T00:00:00+09:00`;
  const timeMax = endDate
    ? `${endDate}T23:59:59+09:00`
    : `${date}T23:59:59+09:00`;

  // 全カレンダーから並列で取得
  const results = await Promise.allSettled(
    calendarIds.map((calId) =>
      calendar.events.list({
        calendarId: calId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
        timeZone: "Asia/Tokyo",
      })
    )
  );

  // 全カレンダーのイベントを統合
  const allEvents: calendar_v3.Schema$Event[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      const items = result.value.data.items || [];
      allEvents.push(...items);
    }
  }

  // 時系列ソート
  allEvents.sort((a, b) => {
    const aTime = a.start?.dateTime || a.start?.date || "";
    const bTime = b.start?.dateTime || b.start?.date || "";
    return aTime.localeCompare(bTime);
  });

  const isMultiDay = !!endDate && endDate !== date;

  const d = new Date(date);
  const dateStr = d.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const headerLabel = isMultiDay
    ? `${dateStr}〜の予定`
    : `${dateStr}の予定`;

  if (allEvents.length === 0) {
    return `📅 ${headerLabel}\n\n予定はありません ✓`;
  }

  let result = `📅 ${headerLabel}（${allEvents.length}件）\n\n`;
  let lastDateStr = "";
  for (const event of allEvents) {
    // 複数日の場合、日付ヘッダーを挿入
    if (isMultiDay) {
      const eventDate = event.start?.dateTime || event.start?.date || "";
      const evDateStr = new Date(eventDate).toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
        timeZone: "Asia/Tokyo",
      });
      if (evDateStr !== lastDateStr) {
        result += `\n── ${evDateStr} ──\n`;
        lastDateStr = evDateStr;
      }
    }

    if (event.start?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;
      const startStr = start.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Tokyo",
      });
      const endStr = end
        ? end.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Tokyo",
          })
        : "";
      result += `⏰ ${startStr}-${endStr}  ${event.summary}\n`;
    } else {
      result += `📌 終日  ${event.summary}\n`;
    }
  }

  return result.trim();
}
