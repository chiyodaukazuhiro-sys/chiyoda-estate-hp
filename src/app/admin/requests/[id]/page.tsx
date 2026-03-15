import { prisma } from "@/lib/db";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";
import { notFound } from "next/navigation";
import NoteForm from "./NoteForm";
import RequestConditions from "./RequestConditions";

function fmt(v: number | null | undefined, unit: string) {
  return v != null ? `${v.toLocaleString()}${unit}` : "指定なし";
}

const statusColor: Record<string, string> = {
  "新規": "bg-gray-100 text-gray-600",
  "対応中": "bg-blue-100 text-blue-700",
  "物件提案済": "bg-orange-100 text-orange-700",
  "成約": "bg-green-100 text-green-700",
  "見送り": "bg-red-100 text-red-700",
};

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const req = await prisma.propertyRequest.findUnique({
    where: { id },
    include: {
      member: true,
      requestNotes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!req) notFound();

  return (
    <AdminShell>
      <Link href="/admin/requests" className="text-sm text-gray-500 hover:text-navy mb-4 inline-block">
        ← リクエスト一覧に戻る
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-navy">リクエスト詳細</h1>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
          statusColor[req.status] || "bg-gray-100 text-gray-600"
        }`}>
          {req.status}
        </span>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
          req.urgency === "急ぎ" ? "bg-red-100 text-red-700" :
          req.urgency === "3ヶ月以内" ? "bg-orange-100 text-orange-700" :
          req.urgency === "半年以内" ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-600"
        }`}>
          {req.urgency}
        </span>
        {req.syncSource && (
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            req.syncSource === "sheet" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
          }`}>
            {req.syncSource === "sheet" ? "📥 フォーム経由" : "🌐 HP経由"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <RequestConditions req={req} />

          {req.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-navy mb-3 text-sm tracking-wider">その他要望</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.notes}</p>
            </div>
          )}

          {/* Note Form */}
          <NoteForm requestId={req.id} />

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-bold text-navy mb-4 text-sm tracking-wider">
              対応履歴（{req.requestNotes.length}件）
            </h2>
            {req.requestNotes.length === 0 ? (
              <p className="text-gray-400 text-sm">対応メモはまだありません</p>
            ) : (
              <div className="space-y-4">
                {req.requestNotes.map((note) => (
                  <div key={note.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                        note.status ? "bg-navy" : "bg-gray-300"
                      }`} />
                      <div className="w-px flex-1 bg-gray-200" />
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                        </span>
                        {note.status && (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            statusColor[note.status] || "bg-gray-100 text-gray-600"
                          }`}>
                            → {note.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copyable text for search */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h2 className="font-bold text-navy mb-3 text-sm tracking-wider">検索用テキスト</h2>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
{`${req.delegateInfo ? `委任先: ${req.delegateInfo}\n` : ""}物件種別: ${req.propertyType.replace(/,/g, " / ")}
利用目的: ${req.purpose}
エリア: ${req.area}${req.excludeArea ? `\n除外: ${req.excludeArea}` : ""}
予算: ${fmt(req.budgetMin, "万円")} 〜 ${fmt(req.budgetMax, "万円")}${req.yieldMin ? `\n利回り: ${req.yieldMin}%以上` : ""}${req.landAreaMin ? `\n土地面積: ${req.landAreaMin}㎡以上` : ""}${req.buildingAreaMin ? `\n建物面積: ${req.buildingAreaMin}㎡以上` : ""}${req.maxAge ? `\n築年数: ${req.maxAge}年以内` : ""}
構造: ${req.structure || "指定なし"}
駐車場: ${req.parking || "指定なし"}`}
            </pre>
          </div>
        </div>

        {/* Member Info Sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-bold text-navy mb-4 text-sm tracking-wider">会員情報</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">会社名</p>
                <Link href={`/admin/members/${req.member.id}`} className="font-bold text-navy hover:text-gold">
                  {req.member.companyName}
                </Link>
              </div>
              <div>
                <p className="text-gray-400 text-xs">担当者</p>
                <p>{req.member.contactName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">業種</p>
                <p>{req.member.category}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">メール</p>
                <p className="break-all">{req.member.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">電話</p>
                <p>{req.member.phone || "未登録"}</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-3 text-center space-y-0.5">
            <p>送信日時: {new Date(req.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>
            {req.syncedAt && (
              <p>同期日時: {new Date(req.syncedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>
            )}
            {req.member.isFormSubmission && (
              <p className="text-purple-500">(Googleフォーム経由の会員)</p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
