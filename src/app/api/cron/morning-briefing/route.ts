import { NextRequest, NextResponse } from "next/server";
import { getLineClient, OWNER_LINE_USER_ID } from "@/lib/line-bot/config";
import { generateBriefing } from "@/lib/line-bot/formatter";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel Cron sends this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!OWNER_LINE_USER_ID) {
    return NextResponse.json(
      { error: "LINE_OWNER_USER_ID not set" },
      { status: 500 }
    );
  }

  try {
    const client = getLineClient();
    const briefing = await generateBriefing();

    await client.pushMessage({
      to: OWNER_LINE_USER_ID,
      messages: [{ type: "text", text: briefing }],
    });

    return NextResponse.json({ ok: true, message: "Briefing sent" });
  } catch (error) {
    console.error("Morning briefing error:", error);
    return NextResponse.json(
      { error: "Failed to send briefing" },
      { status: 500 }
    );
  }
}
