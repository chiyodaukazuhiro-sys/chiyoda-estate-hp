"use client";

import { useState } from "react";
import EditForm from "./EditForm";

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

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value || "指定なし"}</p>
    </div>
  );
}

function fmt(v: number | null | undefined, unit: string) {
  return v != null ? `${v.toLocaleString()}${unit}` : "指定なし";
}

export default function RequestConditions({ req }: { req: RequestData }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditForm req={req} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-navy text-sm tracking-wider">物件条件</h2>
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
        <Field label="物件種別" value={req.propertyType.replace(/,/g, " / ")} />
        <Field label="利用目的" value={req.purpose} />
        <Field label="希望エリア" value={req.area} />
        <Field label="除外エリア" value={req.excludeArea} />
        <Field
          label="予算"
          value={
            req.budgetMin || req.budgetMax
              ? `${fmt(req.budgetMin, "万円")} 〜 ${fmt(req.budgetMax, "万円")}`
              : null
          }
        />
        <Field
          label="希望利回り"
          value={req.yieldMin ? `${req.yieldMin}%以上` : null}
        />
        <Field label="土地面積" value={req.landAreaMin ? `${req.landAreaMin.toLocaleString()}㎡以上` : null} />
        <Field label="建物面積" value={req.buildingAreaMin ? `${req.buildingAreaMin.toLocaleString()}㎡以上` : null} />
        <Field label="築年数" value={req.maxAge ? `${req.maxAge}年以内` : null} />
        <Field label="構造" value={req.structure} />
        <Field label="駐車場" value={req.parking} />
        <Field label="緊急度" value={req.urgency} />
      </div>
    </div>
  );
}
