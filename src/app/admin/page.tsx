import { prisma } from "@/lib/db";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

export default async function AdminDashboard() {
  const [memberCount, requestCount, latestRequests] = await Promise.all([
    prisma.member.count(),
    prisma.propertyRequest.count(),
    prisma.propertyRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { member: { select: { companyName: true, contactName: true, category: true } } },
    }),
  ]);

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-navy mb-6">ダッシュボード</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/members" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">会員数</p>
          <p className="text-3xl font-bold text-navy">{memberCount}</p>
        </Link>
        <Link href="/admin/requests" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">リクエスト数</p>
          <p className="text-3xl font-bold text-navy">{requestCount}</p>
        </Link>
      </div>

      {/* Latest Requests */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-navy">最新リクエスト</h2>
          <Link href="/admin/requests" className="text-sm text-gold hover:underline">
            すべて見る →
          </Link>
        </div>
        {latestRequests.length === 0 ? (
          <p className="px-6 py-8 text-gray-400 text-center text-sm">リクエストはまだありません</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">日付</th>
                <th className="px-6 py-3 font-medium">会員</th>
                <th className="px-6 py-3 font-medium">物件種別</th>
                <th className="px-6 py-3 font-medium">エリア</th>
                <th className="px-6 py-3 font-medium">ステータス</th>
                <th className="px-6 py-3 font-medium">緊急度</th>
              </tr>
            </thead>
            <tbody>
              {latestRequests.map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-medium text-navy">{req.member.companyName}</span>
                    <span className="text-gray-400 ml-1 text-xs">({req.member.category})</span>
                  </td>
                  <td className="px-6 py-3">{req.propertyType.replace(/,/g, " / ")}</td>
                  <td className="px-6 py-3">{req.area}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
