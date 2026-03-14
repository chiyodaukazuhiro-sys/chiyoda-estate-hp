"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateMember } from "./action";

const inputClass =
  "w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

type MemberData = {
  companyName: string;
  contactName: string;
  category: string;
  phone: string | null;
  searchType: string | null;
  email: string;
};

export default function EditMemberForm({ member }: { member: MemberData }) {
  const [state, formAction, isPending] = useActionState(updateMember, {
    success: false,
  });

  return (
    <>
      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 text-sm mb-6">
          会員情報を更新しました。
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={member.email}
            disabled
            className="w-full border border-gray-200 rounded px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            メールアドレスは変更できません
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={member.phone ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/member"
            className="text-sm text-gold hover:underline font-medium"
          >
            マイページに戻る
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-10 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </>
  );
}
