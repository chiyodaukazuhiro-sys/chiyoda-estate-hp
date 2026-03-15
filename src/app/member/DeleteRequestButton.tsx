"use client";

import { useState } from "react";
import { deleteRequest } from "./request/action";

export default function DeleteRequestButton({
  requestId,
  propertyType,
  area,
}: {
  requestId: string;
  propertyType: string;
  area: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        削除
      </button>
    );
  }

  return (
    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-sm text-red-800 font-medium mb-1">
        このリクエストを削除しますか？
      </p>
      <p className="text-xs text-red-600 mb-3">
        {propertyType.replace(/,/g, " / ")} ・ {area}
      </p>
      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={async () => {
            setDeleting(true);
            setError(null);
            const result = await deleteRequest(requestId);
            if (!result.success) {
              setError(result.error || "削除に失敗しました。");
              setDeleting(false);
            }
          }}
          disabled={deleting}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? "削除中..." : "削除する"}
        </button>
        <button
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          disabled={deleting}
          className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
