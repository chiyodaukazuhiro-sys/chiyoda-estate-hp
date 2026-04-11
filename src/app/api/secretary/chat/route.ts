import { NextRequest, NextResponse } from "next/server";
import { isSecretary } from "@/lib/secretary-auth";
import { parseIntent } from "@/lib/line-bot/intent-parser";
import { handleParsedIntent } from "@/lib/secretary/action-handler";

export async function POST(request: NextRequest) {
  // Verify auth
  if (!(await isSecretary())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message: string; history?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, history } = body;
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const parsed = await parseIntent(message);

    // For general intent with conversation history, use Groq for multi-turn chat
    if (parsed.intent === "general" && history && history.length > 0 && process.env.GROQ_API_KEY) {
      try {
        const { default: Groq } = await import("groq-sdk");
        const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const systemPrompt = `あなたはチヨダエステート株式会社の上田和広さんの専属秘書アシスタントです。
不動産業務・スケジュール管理・タスク管理・メモ管理をサポートします。
日本語で簡潔かつ丁寧に返答してください。`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...history.map((h) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
          })),
          { role: "user" as const, content: message },
        ];

        const response = await client.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        });

        const reply = response.choices[0]?.message?.content ?? "申し訳ありません、応答できませんでした。";
        return NextResponse.json({ reply, intent: "general" });
      } catch (groqError) {
        console.error("Groq multi-turn error:", groqError);
        // Fall through to standard handler
      }
    }

    const reply = await handleParsedIntent(parsed, message);
    return NextResponse.json({ reply, intent: parsed.intent });
  } catch (error) {
    console.error("Secretary chat error:", error);
    return NextResponse.json(
      { error: "エラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
