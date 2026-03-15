"use client";

import { useActionState, useState, useEffect } from "react";
import { updateRequest, type EditActionState } from "./action";

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
};

function Field({
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

export default function EditForm({
  req,
  onClose,
}: {
  req: RequestData;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<EditActionState, FormData>(
    updateRequest,
    { success: false },
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-navy text-sm tracking-wider">物件条件を編集</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          キャンセル
        </button>
      </div>
      <form action={formAction}>
        <input type="hidden" name="requestId" value={req.id} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="物件種別" name="propertyType" value={req.propertyType.replace(/,/g, " / ")} />
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
          <Field label="希望エリア" name="area" value={req.area} />
          <Field label="除外エリア" name="excludeArea" value={req.excludeArea || ""} placeholder="指定なし" />
          <Field label="予算下限（万円）" name="budgetMin" type="number" value={req.budgetMin?.toString() || ""} placeholder="指定なし" />
          <Field label="予算上限（万円）" name="budgetMax" type="number" value={req.budgetMax?.toString() || ""} placeholder="指定なし" />
          <Field label="希望利回り（%）" name="yieldMin" type="number" value={req.yieldMin?.toString() || ""} placeholder="指定なし" />
          <Field label="土地面積（㎡以上）" name="landAreaMin" type="number" value={req.landAreaMin?.toString() || ""} placeholder="指定なし" />
          <Field label="建物面積（㎡以上）" name="buildingAreaMin" type="number" value={req.buildingAreaMin?.toString() || ""} placeholder="指定なし" />
          <Field label="築年数（年以内）" name="maxAge" type="number" value={req.maxAge?.toString() || ""} placeholder="指定なし" />
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
