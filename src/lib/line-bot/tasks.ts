import { prisma } from "@/lib/db";

export async function createTask(
  title: string,
  priority: string = "normal",
  dueDate?: string
): Promise<string> {
  const task = await prisma.task.create({
    data: {
      title,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  const priorityEmoji =
    priority === "urgent" ? "🔴" : priority === "important" ? "🟡" : "⚪";
  let result = `✅ タスクを追加しました\n${priorityEmoji} ${task.title}`;
  if (task.dueDate) {
    const dateStr = task.dueDate.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
    result += `\n📅 期限: ${dateStr}`;
  }
  return result;
}

export async function listTasks(
  status?: string
): Promise<string> {
  const where = status ? { status } : { status: { not: "done" } };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { priority: "asc" }, // urgent first (alphabetical: important > normal > urgent doesn't work, use custom)
      { createdAt: "desc" },
    ],
  });

  if (tasks.length === 0) {
    return "📋 タスク一覧\n\n未完了のタスクはありません ✓";
  }

  // Sort by priority manually: urgent > important > normal
  const priorityOrder = { urgent: 0, important: 1, normal: 2 };
  tasks.sort(
    (a, b) =>
      (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
  );

  let result = `📋 タスク一覧（${tasks.length}件）\n\n`;
  for (const task of tasks) {
    const priorityEmoji =
      task.priority === "urgent"
        ? "🔴"
        : task.priority === "important"
          ? "🟡"
          : "⚪";
    const statusEmoji =
      task.status === "in_progress" ? "🔄" : "⬜";
    let line = `${statusEmoji}${priorityEmoji} ${task.title}`;
    if (task.dueDate) {
      const dateStr = task.dueDate.toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
      });
      line += ` (${dateStr}まで)`;
    }
    result += line + "\n";
  }

  return result.trim();
}

export async function completeTask(
  titleQuery: string
): Promise<string> {
  // Find task by partial title match
  const task = await prisma.task.findFirst({
    where: {
      title: { contains: titleQuery, mode: "insensitive" },
      status: { not: "done" },
    },
  });

  if (!task) {
    return `❌ 「${titleQuery}」に一致するタスクが見つかりません`;
  }

  await prisma.task.update({
    where: { id: task.id },
    data: { status: "done" },
  });

  return `✅ 完了にしました\n📝 ${task.title}`;
}

export async function getTaskSummary(): Promise<{
  total: number;
  urgent: number;
  important: number;
}> {
  const tasks = await prisma.task.findMany({
    where: { status: { not: "done" } },
  });

  return {
    total: tasks.length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    important: tasks.filter((t) => t.priority === "important").length,
  };
}
