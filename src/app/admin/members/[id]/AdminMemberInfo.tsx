"use client";

import { useState } from "react";
import { useActionState } from "react";
import { adminUpdateMember } from "./action";

const SEARCH_TYPE_LABELS: Record<string, string> = {
  self: "ご自身",
  proxy: "代理",
};

const inputClass =
  "w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent";

type MemberData = {
  id: string;
  companyName: string;
  contactName: string;
  category: string;
  email: string;
  phone: string | null;
  searchType: string | null;
  createdAt: Date;
};

export default function AdminMemberInfo({ member }: { member: MemberData }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(adminUpdateMember, {
    success: false,
  });

  if (state.success && editing) {
    window.location.reload();
    return null;
  }

  if (!editing) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-sm font-medium text-gray-400">会員情報</h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            編集
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">会社名</p>
            <p className="font-bold text-navy text-lg">{member.companyName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">担当者名</p>
            <p className="font-medium">{member.contactName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">業種</p>
            <p>
              <span className="inline-block px-2 py-0.5 rounded text-xs bg-navy/10 text-navy">
                {member.category}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">物件探しの種別</p>
            <p>{member.searchType ? SEARCH_TYPE_LABELS[member.searchType] ?? member.searchType : "未設定"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">メールアドレス</p>
            <p>{member.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">電話番号</p>
            <p>{member.phone || "未登録"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">登録日</p>
            <p>{new Date(member.createdAt).toLocaleDateString("ja-JP")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-sm font-medium text-gray-400 mb-4">会員情報の編集</h2>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="memberId" value={member.id} />

        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              会社名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              required
              defaultValue={member.companyName}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              担当者名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactName"
              required
              defaultValue={member.contactName}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              業種 <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              defaultValue={member.category}
              className={inputClass}
            >
              <option value="">選択してください</option>
              <option value="金融機関">金融機関</option>
              <option value="士業">士業（弁護士・税理士・司法書士等）</option>
              <option value="医療関係">医療関係</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              物件探しの種別
            </label>
            <select
              name="searchType"
              defaultValue={member.searchType ?? ""}
              className={inputClass}
            >
              <option value="">未設定</option>
              <option value="self">ご自身で探されている</option>
              <option value="proxy">紹介先のお客様の代理で探されている</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={member.email}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              電話番号
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={member.phone ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-navy text-white font-bold rounded text-sm hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
