"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateMember } from "./edit/action";
import { logoutMember } from "./logout/action";

const SEARCH_TYPE_LABELS: Record<string, string> = {
  self: "ご自身",
  proxy: "代理",
};

const inputClass =
  "w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

type MemberData = {
  companyName: string;
  contactName: string;
  category: string;
  phone: string | null;
  searchType: string | null;
  email: string;
};

export default function MemberInfo({ member }: { member: MemberData }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateMember, {
    success: false,
  });

  // 保存成功したら表示モードに戻る
  if (state.success && editing) {
    // ページをリロードして最新データを反映
    window.location.reload();
    return null;
  }

  if (!editing) {
    return (
      <div className="bg-cream rounded-lg p-6 mb-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">会員情報</p>
            <p className="font-bold text-navy text-lg">{member.companyName}</p>
            <p className="text-sm text-gray-600">
              {member.contactName}様（{member.category}）
            </p>
            <p className="text-sm text-gray-500 mt-1">{member.email}</p>
            {member.phone && (
              <p className="text-sm text-gray-500">TEL: {member.phone}</p>
            )}
            {member.searchType && (
              <p className="text-sm text-gray-500">
                種別: {SEARCH_TYPE_LABELS[member.searchType] ?? member.searchType}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm text-gold hover:underline font-medium"
            >
              会員情報を編集
            </button>
            <form action={logoutMember}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-lg p-6 mb-10">
      <p className="text-sm text-gray-500 mb-4">会員情報の編集</p>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              会社名・事務所名 <span className="text-red-500">*</span>
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
              ご担当者名 <span className="text-red-500">*</span>
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
              <option value="">選択してください</option>
              <option value="self">ご自身で探されている</option>
              <option value="proxy">紹介先のお客様の代理で探されている</option>
            </select>
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

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={member.email}
              disabled
              className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
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
            className="px-6 py-2 bg-gold text-navy font-bold rounded text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
