"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { addNote, type NoteActionState } from "./action";
import { detectStatus } from "./detect-status";

const STATUSES = ["変更なし", "対応中", "物件提案済", "成約", "見送り"];

export default function NoteForm({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState<NoteActionState, FormData>(
    addNote,
    { success: false },
  );
  const [text, setText] = useState("");
  const [status, setStatus] = useState("変更なし");
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-detect status from text
  useEffect(() => {
    const detected = detectStatus(text);
    setStatus(detected ?? "変更なし");
  }, [text]);

  // Reset form on success
  useEffect(() => {
    if (state.success) {
      setText("");
      setStatus("変更なし");
    }
  }, [state]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-bold text-navy mb-3 text-sm tracking-wider">対応メモを追加</h2>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <textarea
          name="content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="対応内容を入力...（例: REINS検索開始、物件3件提案済み）"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy resize-none"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-500">ステータス:</label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-navy/30 focus:border-navy"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {status !== "変更なし" && text && (
              <span className="text-xs text-gray-400">← 自動推定</span>
            )}
          </div>
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="bg-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy-light disabled:opacity-40 transition-colors"
          >
            {pending ? "送信中..." : "追加"}
          </button>
        </div>
        {state.error && (
          <p className="text-red-600 text-xs mt-2">{state.error}</p>
        )}
      </form>
    </div>
  );
}
