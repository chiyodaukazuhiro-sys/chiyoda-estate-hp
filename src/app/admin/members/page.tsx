import { prisma } from "@/lib/db";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { companyName: { contains: q } },
      { contactName: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const members = await prisma.member.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { requests: true } } },
  });

  const categories = ["金融機関", "士業", "医療関係", "その他"];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-navy mb-6">会員一覧</h1>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="会社名・担当者名で検索"
          className="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <select
          name="category"
          defaultValue={category}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">すべての業種</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-navy text-white text-sm rounded hover:bg-navy-light transition-colors"
        >
          検索
        </button>
        {(q || category) && (
          <Link href="/admin/members" className="px-4 py-2 text-sm text-gray-500 hover:text-navy">
            クリア
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">会社名</th>
              <th className="px-6 py-3 font-medium">担当者</th>
              <th className="px-6 py-3 font-medium">業種</th>
              <th className="px-6 py-3 font-medium">メール</th>
              <th className="px-6 py-3 font-medium">登録日</th>
              <th className="px-6 py-3 font-medium text-center">リクエスト数</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  該当する会員がいません
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link href={`/admin/members/${m.id}`} className="font-medium text-navy hover:text-gold">
                      {m.companyName}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{m.contactName}</td>
                  <td className="px-6 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-navy/10 text-navy">
                      {m.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{m.email}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(m.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-3 text-center">{m._count.requests}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">{members.length}件</p>
    </AdminShell>
  );
}
