import { prisma } from "@/lib/db";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteMemberButton from "./DeleteMemberButton";
import AdminMemberInfo from "./AdminMemberInfo";

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      requests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!member) notFound();

  return (
    <AdminShell>
      <Link href="/admin/members" className="text-sm text-gray-500 hover:text-navy mb-4 inline-block">
        ← 会員一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-navy mb-6">会員詳細</h1>

      {/* Member Info */}
      <AdminMemberInfo member={member} />

      {/* Delete */}
      <div className="mb-6">
        <DeleteMemberButton
          memberId={member.id}
          memberName={member.companyName || member.contactName || member.email}
          requestCount={member.requests.length}
        />
      </div>

      {/* Requests */}
      <h2 className="text-lg font-bold text-navy mb-3">
        リクエスト履歴（{member.requests.length}件）
      </h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {member.requests.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">リクエストはまだありません</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">日付</th>
                <th className="px-6 py-3 font-medium">物件種別</th>
                <th className="px-6 py-3 font-medium">エリア</th>
                <th className="px-6 py-3 font-medium">予算</th>
                <th className="px-6 py-3 font-medium">緊急度</th>
              </tr>
            </thead>
            <tbody>
              {member.requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500">
                    <Link href={`/admin/requests/${req.id}`} className="hover:text-gold">
                      {new Date(req.createdAt).toLocaleDateString("ja-JP")}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{req.propertyType.replace(/,/g, " / ")}</td>
                  <td className="px-6 py-3">{req.area}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {req.budgetMin || req.budgetMax
                      ? `${req.budgetMin?.toLocaleString() || "—"}〜${req.budgetMax?.toLocaleString() || "—"}万円`
                      : "指定なし"}
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
