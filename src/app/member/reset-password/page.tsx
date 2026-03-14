"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { resetPassword } from "./action";

const inputClass =
  "w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction, isPending] = useActionState(resetPassword, {
    success: false,
  });

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm mb-6">
          無効なリンクです。
        </div>
        <Link
          href="/member/forgot-password"
          className="text-gold hover:underline font-medium text-sm"
        >
          パスワード再設定を申し込む
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 text-sm mb-6">
          パスワードを再設定しました。
          <br />
          新しいパスワードでログインしてください。
        </div>
        <Link
          href="/member/login"
          className="inline-block px-12 py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors text-lg"
        >
          ログインページへ
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-600 mb-8 text-center">
        新しいパスワードを入力してください。
      </p>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="token" value={token} />

        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            新しいパスワード
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
            新しいパスワード（確認）
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
            {isPending ? "設定中..." : "パスワードを再設定する"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-center text-gray-500">読み込み中...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
