import { prisma } from "@/lib/db";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ urgency?: string }>;
}) {
  const params = await searchParams;
  const urgency = params.urgency || "";

  const where: Record<string, unknown> = {};
  if (urgency) where.urgency = urgency;

  const requests = await prisma.propertyRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { member: { select: { companyName: true, contactName: true, category: true } } },
  });

  const urgencies = ["急ぎ", "3ヶ月以内", "半年以内", "情報収集中"];

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-navy mb-6">リクエスト一覧</h1>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6">
        <select
          name="urgency"
          defaultValue={urgency}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">すべての緊急度</option>
          {urgencies.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-navy text-white text-sm rounded hover:bg-navy-light transition-colors"
        >
          絞り込み
        </button>
        {urgency && (
          <Link href="/admin/requests" className="px-4 py-2 text-sm text-gray-500 hover:text-navy">
            クリア
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">日付</th>
              <th className="px-6 py-3 font-medium">ソース</th>
              <th className="px-6 py-3 font-medium">会員</th>
              <th className="px-6 py-3 font-medium">物件種別</th>
              <th className="px-6 py-3 font-medium">エリア</th>
              <th className="px-6 py-3 font-medium">予算</th>
              <th className="px-6 py-3 font-medium">ステータス</th>
              <th className="px-6 py-3 font-medium">緊急度</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  該当するリクエストがありません
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500">
                    <Link href={`/admin/requests/${req.id}`} className="hover:text-gold">
                      {new Date(req.createdAt).toLocaleDateString("ja-JP")}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      req.syncSource === "sheet" ? "bg-purple-100 text-purple-700" :
                      req.syncSource === "hp" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {req.syncSource === "sheet" ? "フォーム" : req.syncSource === "hp" ? "HP" : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/members/${req.memberId}`} className="font-medium text-navy hover:text-gold">
                      {req.member.companyName}
                    </Link>
                    <span className="text-gray-400 ml-1 text-xs">({req.member.category})</span>
                  </td>
                  <td className="px-6 py-3">{req.propertyType.replace(/,/g, " / ")}</td>
                  <td className="px-6 py-3">{req.area}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {req.budgetMin || req.budgetMax
                      ? `${req.budgetMin?.toLocaleString() || "—"}〜${req.budgetMax?.toLocaleString() || "—"}万円`
                      : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      req.status === "対応中" ? "bg-blue-100 text-blue-700" :
                      req.status === "物件提案済" ? "bg-orange-100 text-orange-700" :
                      req.status === "成約" ? "bg-green-100 text-green-700" :
                      req.status === "見送り" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      req.urgency === "急ぎ" ? "bg-red-100 text-red-700" :
                      req.urgency === "3ヶ月以内" ? "bg-orange-100 text-orange-700" :
                      req.urgency === "半年以内" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">{requests.length}件</p>
    </AdminShell>
  );
}
