import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKey } from "@/lib/api-auth";

interface NoteEntry {
  recipientEmail: string;
  subject: string;
  sentAt: string;
  propertyName?: string;
  summary?: string;
}

interface SkippedEntry {
  email: string;
  subject: string;
  reason: string;
}

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { entries: NoteEntry[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    return NextResponse.json({ error: "entries array required" }, { status: 400 });
  }

  const created: string[] = [];
  const skipped: SkippedEntry[] = [];

  for (const entry of body.entries) {
    const { recipientEmail, subject, sentAt, propertyName, summary } = entry;

    if (!recipientEmail || !subject || !sentAt) {
      skipped.push({
        email: recipientEmail || "unknown",
        subject: subject || "unknown",
        reason: "Missing required fields (recipientEmail, subject, sentAt)",
      });
      continue;
    }

    // Find member by email
    const member = await prisma.member.findUnique({
      where: { email: recipientEmail.trim().toLowerCase() },
      include: {
        requests: {
          where: {
            status: { notIn: ["成約", "見送り"] },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!member) {
      skipped.push({ email: recipientEmail, subject, reason: "Member not found" });
      continue;
    }

    if (member.requests.length === 0) {
      skipped.push({
        email: recipientEmail,
        subject,
        reason: "No active PropertyRequest found",
      });
      continue;
    }

    const targetRequest = member.requests[0];

    // Format the note content
    const dateStr = formatDate(sentAt);
    const propLabel = propertyName ? `（${propertyName}）` : "";
    const summaryText = summary || "物件資料を送付";
    const content = `[自動] ${dateStr} ${summaryText}${propLabel}。反応待ち。`;

    // Check for duplicate (same requestId + similar content within last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.requestNote.findFirst({
      where: {
        requestId: targetRequest.id,
        content: { contains: propertyName || subject.slice(0, 20) },
        createdAt: { gte: oneDayAgo },
      },
    });

    if (existing) {
      skipped.push({ email: recipientEmail, subject, reason: "Duplicate note detected" });
      continue;
    }

    await prisma.requestNote.create({
      data: {
        requestId: targetRequest.id,
        content,
        status: null,
      },
    });

    created.push(`${member.contactName} (${recipientEmail}): ${content}`);
  }

  return NextResponse.json({
    processed: body.entries.length,
    created: created.length,
    createdDetails: created,
    skipped,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}
