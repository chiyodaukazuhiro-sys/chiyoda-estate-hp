import { prisma } from "@/lib/db";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business: ["不動産", "物件", "DM", "チヨダ", "仲介", "売主", "顧客", "概要書", "REINS"],
  investment: ["株", "投資", "配当", "銘柄", "ポートフォリオ", "利回り"],
  corporate: ["阪急", "経費", "承認", "社内", "規定", "有給", "出張"],
  family: ["家族", "子供", "学校", "病院", "習い事"],
  personal: ["筋トレ", "健康", "ジム", "読書"],
};

function detectCategory(content: string): string {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => content.includes(kw))) {
      return category;
    }
  }
  return "general";
}

function extractTags(content: string): string {
  const tags: string[] = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (content.includes(kw)) {
        tags.push(kw);
      }
    }
  }
  return tags.slice(0, 5).join(",");
}

export async function saveMemo(content: string): Promise<string> {
  const category = detectCategory(content);
  const tags = extractTags(content);

  const memo = await prisma.memo.create({
    data: { content, category, tags: tags || null },
  });

  const categoryLabel: Record<string, string> = {
    business: "事業",
    investment: "投資",
    corporate: "会社",
    family: "家族",
    personal: "個人",
    general: "一般",
  };

  return `📝 メモ保存\n${memo.content}\n🏷️ ${categoryLabel[category] || "一般"}`;
}

export async function searchMemos(query: string): Promise<string> {
  const memos = await prisma.memo.findMany({
    where: {
      OR: [
        { content: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (memos.length === 0) {
    return `🔍 「${query}」に一致するメモはありません`;
  }

  let result = `🔍 検索結果（${memos.length}件）\n\n`;
  for (const memo of memos) {
    const date = memo.createdAt.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    });
    const preview = memo.content.length > 40
      ? memo.content.substring(0, 40) + "..."
      : memo.content;
    result += `📝 ${preview}\n   ${date}\n`;
  }
  return result.trim();
}

export async function listRecentMemos(): Promise<string> {
  const memos = await prisma.memo.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (memos.length === 0) {
    return "📝 メモはまだありません";
  }

  let result = `📝 最近のメモ（${memos.length}件）\n\n`;
  for (const memo of memos) {
    const date = memo.createdAt.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    });
    const preview = memo.content.length > 35
      ? memo.content.substring(0, 35) + "..."
      : memo.content;
    result += `• ${preview} (${date})\n`;
  }
  return result.trim();
}

export async function deleteMemo(query: string): Promise<string> {
  const memo = await prisma.memo.findFirst({
    where: { content: { contains: query, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
  });

  if (!memo) {
    return `❌ 「${query}」に一致するメモが見つかりません`;
  }

  await prisma.memo.delete({ where: { id: memo.id } });
  const preview = memo.content.length > 30
    ? memo.content.substring(0, 30) + "..."
    : memo.content;
  return `🗑️ メモを削除しました\n📝 ${preview}`;
}
