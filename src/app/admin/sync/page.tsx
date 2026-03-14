"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/AdminShell";
import {
  syncFromSheet,
  resyncToSheet,
  testConnection,
  getSyncStatus,
  type SyncResult,
  type ConnectionTestResult,
} from "./action";

export default function SyncPage() {
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [connectionTest, setConnectionTest] =
    useState<ConnectionTestResult | null>(null);
  const [status, setStatus] = useState<{
    totalRequests: number;
    syncedCount: number;
    unsyncedCount: number;
    fromSheet: number;
    fromHp: number;
    formMembers: number;
  } | null>(null);
  const [loading, setLoading] = useState("");

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    const s = await getSyncStatus();
    setStatus(s);
  }

  async function handleTestConnection() {
    setLoading("test");
    setConnectionTest(null);
    const result = await testConnection();
    setConnectionTest(result);
    setLoading("");
  }

  async function handleSyncFromSheet() {
    setLoading("pull");
    setSyncResult(null);
    const result = await syncFromSheet();
    setSyncResult(result);
    await loadStatus();
    setLoading("");
  }

  async function handleResyncToSheet() {
    setLoading("push");
    setSyncResult(null);
    const result = await resyncToSheet();
    setSyncResult(result);
    await loadStatus();
    setLoading("");
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-navy mb-6">
        スプレッドシート同期
      </h1>

      {/* ステータスカード */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatusCard label="全リクエスト" value={status.totalRequests} />
          <StatusCard
            label="同期済み"
            value={status.syncedCount}
            color="green"
          />
          <StatusCard
            label="未同期"
            value={status.unsyncedCount}
            color={status.unsyncedCount > 0 ? "red" : "gray"}
          />
          <StatusCard label="HP発" value={status.fromHp} color="blue" />
          <StatusCard
            label="フォーム発"
            value={status.fromSheet}
            color="purple"
          />
          <StatusCard
            label="フォーム会員"
            value={status.formMembers}
            color="gray"
          />
        </div>
      )}

      {/* アクションボタン */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-bold text-navy mb-4">同期アクション</h2>

        <div className="flex flex-wrap gap-3">
          {/* 接続テスト */}
          <button
            onClick={handleTestConnection}
            disabled={loading !== ""}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {loading === "test" ? "テスト中..." : "🔌 接続テスト"}
          </button>

          {/* シート→HP */}
          <button
            onClick={handleSyncFromSheet}
            disabled={loading !== ""}
            className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading === "pull"
              ? "取込中..."
              : "📥 シート → HP（フォーム回答を取込）"}
          </button>

          {/* HP→シート */}
          <button
            onClick={handleResyncToSheet}
            disabled={loading !== ""}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading === "push"
              ? "同期中..."
              : "📤 HP → シート（未同期を送信）"}
          </button>
        </div>

        {/* 接続テスト結果 */}
        {connectionTest && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              connectionTest.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {connectionTest.success ? "✅" : "❌"} {connectionTest.message}
          </div>
        )}

        {/* 同期結果 */}
        {syncResult && (
          <div
            className={`mt-4 p-4 rounded-md text-sm ${
              syncResult.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`font-medium ${syncResult.success ? "text-green-800" : "text-red-800"}`}
            >
              {syncResult.success ? "✅" : "❌"} {syncResult.message}
            </p>

            {syncResult.success && (
              <div className="mt-2 flex gap-4 text-gray-600">
                {syncResult.imported > 0 && <span>📥 取込: {syncResult.imported}件</span>}
                {syncResult.updated > 0 && <span>🔄 更新: {syncResult.updated}件</span>}
                {syncResult.deleted > 0 && <span>🗑️ 削除: {syncResult.deleted}件</span>}
                <span>スキップ: {syncResult.skipped}件</span>
              </div>
            )}

            {syncResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-red-700 font-medium mb-1">エラー:</p>
                <ul className="list-disc list-inside text-red-600 text-xs space-y-0.5">
                  {syncResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 説明 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="font-bold text-navy mb-3">同期の仕組み</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <span className="font-medium text-purple-700">📥 シート → HP:</span>{" "}
            Googleフォームの回答をHP管理画面に取り込みます。新規行の取込、既存行の差分更新、シートから削除された行のHP側削除を自動で行います。
          </p>
          <p>
            <span className="font-medium text-blue-700">📤 HP → シート:</span>{" "}
            HP会員のリクエストをスプレッドシートに反映します。未同期（syncedAtが空）のレコードが対象です。
          </p>
          <p>
            <span className="font-medium text-gray-700">🔄 自動同期:</span>{" "}
            HP会員がリクエスト送信時は自動でシートに追記されます。Googleフォーム回答はこのページで手動取込してください。
          </p>
        </div>
      </div>
    </AdminShell>
  );
}

function StatusCard({
  label,
  value,
  color = "navy",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    navy: "text-navy",
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    gray: "text-gray-500",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || "text-navy"}`}>
        {value}
      </p>
    </div>
  );
}
