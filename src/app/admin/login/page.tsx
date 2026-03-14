"use client";

import { useActionState } from "react";
import { adminLogin } from "./action";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, {
    success: false,
  });

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-gold text-xs tracking-[0.3em] mb-2">
            ADMIN
          </p>
          <h1 className="font-serif text-2xl font-bold text-white">
            管理画面ログイン
          </h1>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="bg-red-500/20 border border-red-400/50 text-red-200 rounded px-4 py-3 text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              パスワード
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-gray-600 bg-navy-light text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="管理者パスワード"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-gold text-navy font-bold rounded hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {isPending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
