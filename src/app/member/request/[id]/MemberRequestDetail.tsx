"use client";

import { useState, useActionState, useEffect } from "react";
import { updateMemberRequest, deleteRequest, type MemberEditState } from "../action";

type RequestData = {
  id: string;
  propertyType: string;
  purpose: string;
  area: string;
  excludeArea: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  yieldMin: number | null;
  landAreaMin: number | null;
  buildingAreaMin: number | null;
  maxAge: number | null;
  structure: string | null;
  parking: string | null;
  urgency: string;
  notes: string | null;
  delegateInfo: string | null;
  createdAt: string;
};

function ViewField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value || "指定なし"}</p>
    </div>
  );
}

function EditField({
  label,
  name,
  value,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-gray-400 text-xs mb-1 block">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy"
      />
    </div>
  );
}

function fmt(v: number | null | undefined, unit: string) {
  return v != null ? `${v.toLocaleString()}${unit}` : "指定なし";
}

export default function MemberRequestDetail({ req }: { req: RequestData }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<MemberEditState, FormData>(
    updateMemberRequest,
    { success: false },
  );

  useEffect(() => {
    if (state.success) {
      setEditing(false);
    }
  }, [state]);

  const urgencyColor =
    req.urgency === "急ぎ" ? "bg-red-100 text-red-700" :
    req.urgency === "3ヶ月以内" ? "bg-orange-100 text-orange-700" :
    req.urgency === "半年以内" ? "bg-blue-100 text-blue-700" :
    "bg-gray-100 text-gray-600";

  if (editing) {
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-navy">物件条件を編集</h2>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            キャンセル
          </button>
        </div>
        <form action={formAction}>
          <input type="hidden" name="requestId" value={req.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="物件種別" name="propertyType" value={req.propertyType.replace(/,/g, " / ")} />
            <div>
              <label className="text-gray-400 text-xs mb-1 block">利用目的</label>
              <select
                name="purpose"
                defaultValue={req.purpose}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy"
              >
                {["自己居住", "投資", "事業用", "社宅", "開業", "その他"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <EditField label="希望エリア" name="area" value={req.area} />
            <EditField label="除外エリア" name="excludeArea" value={req.excludeArea || ""} placeholder="指定なし" />
            <EditField label="予算下限（万円）" name="budgetMin" type="number" value={req.budgetMin?.toString() || ""} placeholder="指定なし" />
            <EditField label="予算上限（万円）" name="budgetMax" type="number" value={req.budgetMax?.toString() || ""} placeholder="指定なし" />
            <EditField label="希望利回り（%）" name="yieldMin" type="number" value={req.yieldMin?.toString() || ""} placeholder="指定なし" />
            <EditField label="土地面積（㎡以上）" name="landAreaMin" type="number" value={req.landAreaMin?.toString() || ""} placeholder="指定なし" />
            <EditField label="建物面積（㎡以上）" name="buildingAreaMin" type="number" value={req.buildingAreaMin?.toString() || ""} placeholder="指定なし" />
            <EditField label="築年数（年以内）" name="maxAge" type="number" value={req.maxAge?.toString() || ""} placeholder="指定なし" />
            <div>
              <label className="text-gray-400 text-xs mb-1 block">構造</label>
              <select
                name="structure"
                defaultValue={req.structure || ""}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy"
              >
                <option value="">指定なし</option>
                {["RC", "SRC", "S造", "木造"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">駐車場</label>
              <select
                name="parking"
                defaultValue={req.parking || ""}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy"
              >
                <option value="">指定なし</option>
                {["必要", "不要", "あれば可"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">緊急度</label>
              <select
                name="urgency"
                defaultValue={req.urgency}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy"
              >
                {["急ぎ", "3ヶ月以内", "半年以内", "情報収集中"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">委任先</label>
              <textarea
                name="delegateInfo"
                defaultValue={req.delegateInfo || ""}
                rows={2}
                placeholder="代理の場合のお客様情報"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">その他要望</label>
              <textarea
                name="notes"
                defaultValue={req.notes || ""}
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy resize-none"
              />
            </div>
          </div>
          {state.error && (
            <p className="text-red-600 text-xs mt-2">{state.error}</p>
          )}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={pending}
              className="bg-navy text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-navy-light disabled:opacity-40 transition-colors"
            >
              {pending ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with urgency badge */}
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-lg font-bold text-navy">
          {req.propertyType.replace(/,/g, " / ")}
        </h2>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${urgencyColor}`}>
          {req.urgency}
        </span>
      </div>

      {/* Conditions */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy text-sm tracking-wider">物件条件</h3>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-navy border border-gray-300 hover:border-navy rounded px-3 py-1 transition-colors"
          >
            編集
          </button>
        </div>
        {req.delegateInfo && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-gray-400 text-xs mb-0.5">委任先</p>
            <p className="text-sm font-medium whitespace-pre-wrap">{req.delegateInfo}</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ViewField label="物件種別" value={req.propertyType.replace(/,/g, " / ")} />
          <ViewField label="利用目的" value={req.purpose} />
          <ViewField label="希望エリア" value={req.area} />
          <ViewField label="除外エリア" value={req.excludeArea} />
          <ViewField
            label="予算"
            value={
              req.budgetMin || req.budgetMax
                ? `${fmt(req.budgetMin, "万円")} 〜 ${fmt(req.budgetMax, "万円")}`
                : null
            }
          />
          <ViewField
            label="希望利回り"
            value={req.yieldMin ? `${req.yieldMin}%以上` : null}
          />
          <ViewField label="土地面積" value={req.landAreaMin ? `${req.landAreaMin.toLocaleString()}㎡以上` : null} />
          <ViewField label="建物面積" value={req.buildingAreaMin ? `${req.buildingAreaMin.toLocaleString()}㎡以上` : null} />
          <ViewField label="築年数" value={req.maxAge ? `${req.maxAge}年以内` : null} />
          <ViewField label="構造" value={req.structure} />
          <ViewField label="駐車場" value={req.parking} />
          <ViewField label="緊急度" value={req.urgency} />
        </div>
      </div>

      {/* Notes */}
      {req.notes && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-navy mb-3 text-sm tracking-wider">その他要望</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.notes}</p>
        </div>
      )}

      {/* Meta + Delete */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
        <p>送信日時: {new Date(req.createdAt).toLocaleDateString("ja-JP")}</p>
        <div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              このリクエストを削除
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {deleteError && <span className="text-red-600">{deleteError}</span>}
              <button
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError(null);
                  const result = await deleteRequest(req.id);
                  if (!result.success) {
                    setDeleteError(result.error || "削除に失敗しました。");
                    setDeleting(false);
                  }
                  // On success, the page will redirect via revalidation
                }}
                disabled={deleting}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
              <button
                onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
                disabled={deleting}
                className="text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
