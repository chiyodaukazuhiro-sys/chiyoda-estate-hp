"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerMember } from "./action";

const inputClass =
  "w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerMember, {
    success: false,
  });

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">
            MEMBER
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            会員登録
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 mb-8 text-center">
            会員登録いただくと、物件リクエストフォームをご利用いただけます。
            <br />
            金融機関・士業・医療関係の皆さま向けのサービスです。
          </p>

          <form action={formAction} className="space-y-5">
            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
                {state.error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社名・事務所名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                className={inputClass}
                placeholder="例：○○銀行 / ○○法律事務所"
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
                className={inputClass}
                placeholder="例：山田 太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                業種 <span className="text-red-500">*</span>
              </label>
              <select name="category" required className={inputClass}>
                <option value="">選択してください</option>
                <option value="金融機関">金融機関</option>
                <option value="士業">士業（弁護士・税理士・司法書士等）</option>
                <option value="医療関係">医療関係</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                物件探しの種別 <span className="text-red-500">*</span>
              </label>
              <select name="searchType" required className={inputClass}>
                <option value="">選択してください</option>
                <option value="self">ご自身で探されている</option>
                <option value="proxy">紹介先のお客様の代理で探されている</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                className={inputClass}
                placeholder="例：example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                name="phone"
                className={inputClass}
                placeholder="例：06-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className={inputClass}
                placeholder="6文字以上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                className={inputClass}
                placeholder="もう一度入力してください"
              />
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-12 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "登録中..." : "会員登録する"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            既にアカウントをお持ちの方は{" "}
            <Link
              href="/member/login"
              className="text-gold hover:underline font-medium"
            >
              ログイン
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
