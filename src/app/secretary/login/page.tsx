"use client";

import { useActionState } from "react";
import { secretaryLogin } from "./action";

export default function SecretaryLoginPage() {
  const [state, formAction, isPending] = useActionState(secretaryLogin, {
    success: false,
  });

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <p className="font-display text-gold text-xs tracking-[0.3em] mb-2">
            CHIYODA ESTATE
          </p>
          <h1 className="font-serif text-2xl font-bold text-white">
            秘書AI
          </h1>
          <p className="text-gray-400 text-sm mt-2">PINコードを入力してください</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="bg-red-500/20 border border-red-400/50 text-red-200 rounded px-4 py-3 text-sm text-center">
              {state.error}
            </div>
          )}

          <div>
            <input
              type="password"
              name="pin"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              autoFocus
              className="w-full border border-gray-600 bg-navy-light text-white rounded-lg px-4 py-4 text-center text-3xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent placeholder-gray-600"
              placeholder="••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-gold text-navy font-bold rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 text-lg"
          >
            {isPending ? "確認中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
