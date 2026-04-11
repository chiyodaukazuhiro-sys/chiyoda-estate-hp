export type IntentType =
  | "calendar_create"
  | "calendar_list"
  | "task_create"
  | "task_list"
  | "task_done"
  | "memo_save"
  | "memo_search"
  | "memo_list"
  | "memo_delete"
  | "briefing"
  | "general";

export interface ParsedIntent {
  intent: IntentType;
  params: {
    title?: string;
    date?: string; // YYYY-MM-DD
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
    duration?: number; // minutes
    priority?: "urgent" | "important" | "normal";
    taskTitle?: string;
    message?: string;
  };
}

function getJSTDate(offset = 0): Date {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000 + offset * 86400000);
  return jst;
}

function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function resolveDate(text: string): string | undefined {
  if (text.includes("今日")) return formatDate(getJSTDate(0));
  if (text.includes("明日")) return formatDate(getJSTDate(1));
  if (text.includes("明後日")) return formatDate(getJSTDate(2));

  // Match MM/DD or MM月DD日
  const dateMatch = text.match(/(\d{1,2})[\/月](\d{1,2})/);
  if (dateMatch) {
    const now = getJSTDate();
    const year = now.getUTCFullYear();
    const month = dateMatch[1].padStart(2, "0");
    const day = dateMatch[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return undefined;
}

function resolveTime(text: string): { startTime?: string; endTime?: string } {
  // Match patterns like "14時", "14:00", "午後2時", "15時半"
  const timePatterns = [
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})時半/,
    /(\d{1,2})時(\d{1,2})分/,
    /(\d{1,2})時/,
    /午後(\d{1,2})時/,
    /午前(\d{1,2})時/,
  ];

  let hour: number | undefined;
  let minute = 0;

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes("午後")) {
        hour = parseInt(match[1]) + 12;
      } else if (pattern.source.includes("午前")) {
        hour = parseInt(match[1]);
      } else {
        hour = parseInt(match[1]);
        if (match[2]) minute = parseInt(match[2]);
      }
      if (pattern.source.includes("半")) minute = 30;
      break;
    }
  }

  if (hour === undefined) return {};

  const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const endHour = (hour + 1) % 24;
  const endTime = `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return { startTime, endTime };
}

function extractTitle(text: string): string {
  // Remove date/time related words and common particles
  return text
    .replace(/今日|明日|明後日|\d{1,2}[\/月]\d{1,2}日?/g, "")
    .replace(/\d{1,2}時(半|\d{1,2}分)?/g, "")
    .replace(/\d{1,2}:\d{2}/g, "")
    .replace(/午前|午後/g, "")
    .replace(/に予定|を入れて|を登録|を追加|予定入れて/g, "")
    .replace(/^[にをはがのと、。\s]+|[にをはがのと、。\s]+$/g, "")
    .trim() || "予定";
}

export async function parseIntent(userMessage: string): Promise<ParsedIntent> {
  const msg = userMessage.trim().toLowerCase();

  // Priority 0: Critical keyword patterns (AI misinterpretation prevention)
  if (/おはよう|おは$/.test(msg)) {
    return { intent: "briefing", params: {} };
  }
  if (/タスク.*(教えて|一覧|確認|見せて|残|リスト)|やること|todo|残タスク/.test(msg)) {
    return { intent: "task_list", params: {} };
  }
  if (/予定.*(教えて|確認|見せて)|スケジュール.*(教えて|確認|見せて)/.test(msg)) {
    return { intent: "calendar_list", params: { date: resolveDate(msg) || formatDate(getJSTDate(0)) } };
  }
  if (/メモ一覧|メモ.*(見せて|教えて|確認)/.test(msg)) {
    return { intent: "memo_list", params: {} };
  }

  // Groq API mode (if available) - priority 1
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("Using Groq API for intent parsing");
      return await parseWithGroq(userMessage);
    } catch (e) {
      console.error("Groq API error:", e);
      // Fall through to next option
    }
  } else {
    console.log("GROQ_API_KEY not set, trying next option");
  }

  // Gemini API mode (if available) - priority 2
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("Using Gemini API for intent parsing");
      return await parseWithGemini(userMessage);
    } catch (e) {
      console.error("Gemini API error:", e);
      // Fall through to keyword mode
    }
  }

  // Claude API mode (if available) - priority 3
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await parseWithClaude(userMessage);
    } catch {
      // Fall through to keyword mode
    }
  }

  // Keyword-based parsing (enhanced for natural Japanese)

  // Briefing
  if (/おはよう|ブリーフィング|まとめ|状況|レポート|おは/.test(msg)) {
    return { intent: "briefing", params: {} };
  }

  // Calendar list (natural patterns)
  if (/予定|スケジュール|カレンダー|何がある|何かある|暇|空いて/.test(msg)) {
    const date = resolveDate(msg) || formatDate(getJSTDate(0));
    // Handle "今週" - return today's date but note it
    if (msg.includes("今週")) {
      return { intent: "calendar_list", params: { date: formatDate(getJSTDate(0)) } };
    }
    return { intent: "calendar_list", params: { date } };
  }

  // Calendar create (natural patterns with time)
  if (/\d{1,2}時|\d{1,2}:\d{2}|予定入れ|予定を入れ|予定追加|に行く|打ち合わせ|ミーティング|会議|面談|アポ/.test(msg)) {
    const times = resolveTime(userMessage);
    const date = resolveDate(userMessage) || formatDate(getJSTDate(0));
    const title = extractTitle(userMessage);
    if (times.startTime) {
      return { intent: "calendar_create", params: { title, date, ...times } };
    }
    // No time specified - create as task instead
    return { intent: "task_create", params: { taskTitle: title, priority: "normal", date } };
  }

  // Memo save (natural patterns)
  if (/^(メモ[:：\s]|記録[:：\s]|覚えて|忘れない|メモして)/.test(msg) || /って覚えて|を覚えて|をメモ/.test(msg)) {
    const content = userMessage
      .replace(/^(メモ[:：\s]?|記録[:：\s]?|覚えて[:：\s]?|メモして[:：\s]?)/i, "")
      .replace(/って覚えて|を覚えて|をメモして?|忘れないで/g, "")
      .trim();
    return { intent: "memo_save", params: { message: content || userMessage } };
  }

  // Memo search
  if (/^(検索[:：\s]|メモ検索|思い出して|なんだっけ)|って何|について|どうだっけ/.test(msg)) {
    const query = msg
      .replace(/^(検索[:：\s]?|メモ検索[:：\s]?|思い出して[:：\s]?|なんだっけ[:：\s]?)/g, "")
      .replace(/って何だっけ|って何|について教えて|はどうだっけ|を教えて/g, "")
      .trim();
    if (query.length > 0) {
      return { intent: "memo_search", params: { message: query } };
    }
  }

  // Memo list
  if (/メモ一覧|メモリスト|最近のメモ/.test(msg)) {
    return { intent: "memo_list", params: {} };
  }

  // Memo delete
  if (/メモ削除|メモを消/.test(msg)) {
    const query = msg.replace(/メモ削除[:：\s]?|メモを消す?[:：\s]?/g, "").trim();
    return { intent: "memo_delete", params: { message: query } };
  }

  // Task done
  if (/完了|終わった|done|済み|できた|やった/.test(msg)) {
    const taskTitle = msg
      .replace(/完了|終わった|done|済み|した|できた|やった|を|が/g, "")
      .trim();
    return { intent: "task_done", params: { taskTitle: taskTitle || msg } };
  }

  // Task list
  if (/タスク一覧|タスクリスト|やること|todo|タスク確認|やるべき/.test(msg)) {
    return { intent: "task_list", params: {} };
  }

  // Task create (natural patterns)
  if (/タスク|やらなきゃ|しなきゃ|しないと|しなければ|必要|忘れず/.test(msg)) {
    const taskTitle = msg
      .replace(/をタスクに追加|をタスクに登録|をタスク|タスク追加|タスクに追加|を追加|を登録|やらなきゃ|しなきゃ|しないと|しなければ|必要|忘れず/g, "")
      .trim();
    const priority = /緊急|急ぎ/.test(msg)
      ? "urgent"
      : /重要/.test(msg)
        ? "important"
        : "normal";
    return {
      intent: "task_create",
      params: { taskTitle: taskTitle || msg, priority, date: resolveDate(msg) },
    };
  }

  // General - natural conversation responses
  const generalResponses: Record<string, string> = {
    "調子": "絶好調です！何かお手伝いできることはありますか？",
    "ありがとう": "どういたしまして！他にも何かあればいつでもどうぞ。",
    "お疲れ": "お疲れ様です！今日もお疲れ様でした。",
    "こんにちは": "こんにちは！何かお手伝いしましょうか？",
    "こんばんは": "こんばんは！今日もお疲れ様です。",
    "ヘルプ": "📅 予定: 「明日14時に○○」\n📋 タスク: 「○○しなきゃ」\n📝 メモ: 「○○を覚えて」\n🔍 検索: 「○○って何だっけ」\n📊 朝の報告: 「おはよう」",
    "使い方": "📅 予定: 「明日14時に○○」\n📋 タスク: 「○○しなきゃ」\n📝 メモ: 「○○を覚えて」\n🔍 検索: 「○○って何だっけ」\n📊 朝の報告: 「おはよう」",
    "テスト": "動いてます！何でも聞いてください。",
  };

  for (const [keyword, response] of Object.entries(generalResponses)) {
    if (msg.includes(keyword)) {
      return { intent: "general", params: { message: response } };
    }
  }

  // Default fallback
  return {
    intent: "general",
    params: {
      message: "了解です！\n\n何かお手伝いしましょうか？\n📅 予定 📋 タスク 📝 メモ 📊 ブリーフィング\nが使えます。",
    },
  };
}

async function parseWithGroq(userMessage: string): Promise<ParsedIntent> {
  const { default: Groq } = await import("groq-sdk");
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const now = new Date();
  const todayStr = now.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const systemPrompt = `あなたはLINE Botの意図解析エンジンです。ユーザーメッセージの意図をJSON形式で返してください。
今日は${todayStr}、現在時刻は${now.toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })}です。

JSONのみを返してください（説明不要、マークダウン不要）:
{
  "intent": "calendar_create" | "calendar_list" | "task_create" | "task_list" | "task_done" | "memo_save" | "memo_search" | "memo_list" | "memo_delete" | "briefing" | "general",
  "params": {
    "title": "予定のタイトル",
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM（不明なら開始+1時間）",
    "priority": "urgent" | "important" | "normal",
    "taskTitle": "タスク名",
    "message": "メモ内容 or 検索クエリ or 汎用回答"
  }
}

判定ルール:
- 「明日14時に○○」→ calendar_create
- 「今日の予定」「スケジュール」→ calendar_list
- 「○○をタスクに」「○○やらなきゃ」→ task_create
- 「タスク一覧」「やること」→ task_list
- 「○○完了」「○○終わった」→ task_done
- 「メモ: ○○」「覚えて」→ memo_save（message=メモ内容）
- 「検索: ○○」「○○なんだっけ」→ memo_search（message=検索語）
- 「メモ一覧」→ memo_list
- 「おはよう」「ブリーフィング」→ briefing
- それ以外 → general（messageに自然な日本語の返答を入れる）

「明日」「来週」等は具体日付に変換。自然な会話にも対応し、generalの場合はmessageに適切で自然な日本語の返答を入れること。`;

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as ParsedIntent;
  }

  throw new Error("Failed to parse Groq response");
}

async function parseWithClaude(userMessage: string): Promise<ParsedIntent> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  const now = new Date();
  const todayStr = now.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system: `あなたはユーザーのメッセージから意図を解析するアシスタントです。
今日は${todayStr}です。現在時刻は${now.toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })}です。

以下のJSONフォーマットのみを返してください（説明不要）:
{
  "intent": "calendar_create" | "calendar_list" | "task_create" | "task_list" | "task_done" | "briefing" | "general",
  "params": {
    "title": "予定やタスクのタイトル",
    "date": "YYYY-MM-DD形式の日付",
    "startTime": "HH:MM形式の開始時刻",
    "endTime": "HH:MM形式の終了時刻（不明なら開始+1時間）",
    "priority": "urgent" | "important" | "normal",
    "taskTitle": "タスク名（完了時の検索用）",
    "message": "汎用メッセージへの回答"
  }
}

判定ルール:
- 「明日14時に○○」「○日に予定入れて」→ calendar_create
- 「今日の予定」「明日のスケジュール」→ calendar_list
- 「○○をタスクに追加」「○○やらなきゃ」→ task_create
- 「タスク一覧」「やること」「TODO」→ task_list
- 「○○完了」「○○終わった」→ task_done
- 「ブリーフィング」「今日のまとめ」「おはよう」→ briefing
- それ以外 → general

「明日」「来週月曜」等の相対日付は具体的なYYYY-MM-DDに変換すること。`,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as ParsedIntent;
  }

  throw new Error("Failed to parse Claude response");
}

async function parseWithGemini(userMessage: string): Promise<ParsedIntent> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const now = new Date();
  const todayStr = now.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const prompt = `あなたはLINE Botの意図解析エンジンです。ユーザーメッセージの意図をJSON形式で返してください。
今日は${todayStr}、現在時刻は${now.toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })}です。

JSONのみを返してください（説明不要、マークダウン不要）:
{
  "intent": "calendar_create" | "calendar_list" | "task_create" | "task_list" | "task_done" | "memo_save" | "memo_search" | "memo_list" | "memo_delete" | "briefing" | "general",
  "params": {
    "title": "予定のタイトル",
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM（不明なら開始+1時間）",
    "priority": "urgent" | "important" | "normal",
    "taskTitle": "タスク名",
    "message": "メモ内容 or 検索クエリ or 汎用回答"
  }
}

判定ルール:
- 「明日14時に○○」→ calendar_create
- 「今日の予定」「スケジュール」→ calendar_list
- 「○○をタスクに」「○○やらなきゃ」→ task_create
- 「タスク一覧」「やること」→ task_list
- 「○○完了」「○○終わった」→ task_done
- 「メモ: ○○」「覚えて」→ memo_save（message=メモ内容）
- 「検索: ○○」「○○なんだっけ」→ memo_search（message=検索語）
- 「メモ一覧」→ memo_list
- 「おはよう」「ブリーフィング」→ briefing
- それ以外 → general（messageに自然な返答を入れる）

「明日」「来週」等は具体日付に変換。自然な会話にも対応し、generalの場合はmessageに適切な返答を入れること。

ユーザーメッセージ: ${userMessage}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as ParsedIntent;
  }

  throw new Error("Failed to parse Gemini response");
}
