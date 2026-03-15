"use client";

import { useState } from "react";
import { deleteAdminRequest } from "./action";

export default function DeleteRequestButton({
  requestId,
  noteCount,
}: {
  requestId: string;
  noteCount: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
      >
        このリクエストを削除
      </button>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-sm text-red-800 font-medium mb-1">
        このリクエストを削除しますか？
      </p>
      {noteCount > 0 && (
        <p className="text-xs text-red-600 mb-3">
          ⚠️ {noteCount}件の対応メモも全て削除されます。この操作は取り消せません。
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={async () => {
            setDeleting(true);
            await deleteAdminRequest(requestId);
          }}
          disabled={deleting}
          className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? "削除中..." : "削除する"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
