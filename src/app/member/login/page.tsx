"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginMember } from "./action";

const inputClass =
  "w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginMember, {
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
            会員ログイン
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                name="password"
                required
                className={inputClass}
              />
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-12 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "ログイン中..." : "ログイン"}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              <Link
                href="/member/forgot-password"
                className="text-gold hover:underline font-medium"
              >
                パスワードをお忘れの方
              </Link>
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            アカウントをお持ちでない方は{" "}
            <Link
              href="/member/register"
              className="text-gold hover:underline font-medium"
            >
              会員登録
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
