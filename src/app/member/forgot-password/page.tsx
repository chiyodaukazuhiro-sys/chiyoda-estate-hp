"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./action";

const inputClass =
  "w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, {
    success: false,
  });

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-gold text-sm tracking-[0.3em] mb-2">
            PASSWORD RESET
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            パスワード再設定
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          {state.success ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 text-sm mb-6">
                ご登録のメールアドレス宛にパスワード再設定のご案内を送信しました。
                <br />
                メールに記載のリンクから新しいパスワードを設定してください。
              </div>
              <Link
                href="/member/login"
                className="text-gold hover:underline font-medium text-sm"
              >
                ログインページに戻る
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-8 text-center">
                ご登録のメールアドレスを入力してください。
                <br />
                パスワード再設定のリンクをお送りします。
              </p>

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
                    name="email"
                    required
                    className={inputClass}
                    placeholder="例：example@email.com"
                  />
                </div>

                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-12 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "送信中..." : "送信する"}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                <Link
                  href="/member/login"
                  className="text-gold hover:underline font-medium"
                >
                  ログインページに戻る
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
