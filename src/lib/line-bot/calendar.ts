import { google } from "googleapis";

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

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

export async function createEvent(params: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}): Promise<string> {
  const calendar = getCalendarClient();

  const startDateTime = `${params.date}T${params.startTime}:00`;
  const endDateTime = `${params.date}T${params.endTime}:00`;

  const event = await calendar.events.insert({
    calendarId: CALENDAR_ID,
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

export async function listEvents(date: string): Promise<string> {
  const calendar = getCalendarClient();

  const timeMin = `${date}T00:00:00+09:00`;
  const timeMax = `${date}T23:59:59+09:00`;

  const res = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    timeZone: "Asia/Tokyo",
  });

  const events = res.data.items || [];

  if (events.length === 0) {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
    return `📅 ${dateStr}の予定\n\n予定はありません ✓`;
  }

  const d = new Date(date);
  const dateStr = d.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  let result = `📅 ${dateStr}の予定\n\n`;
  for (const event of events) {
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
