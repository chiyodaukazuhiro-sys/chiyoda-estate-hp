"use server";

import { prisma } from "@/lib/db";
import {
  readSheetRequests,
  writeHpIdToSheet,
  sheetRowToRequestData,
  testSheetConnection,
  deleteSheetRows,
} from "@/lib/sheets";
import bcrypt from "bcryptjs";

export type SyncResult = {
  success: boolean;
  imported: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: string[];
  message: string;
};

export type ConnectionTestResult = {
  success: boolean;
  message: string;
  rowCount?: number;
};

// --- ヘルパー: シート行とDB行の差分チェック ---
function hasChanges(
  row: Awaited<ReturnType<typeof readSheetRequests>>[number],
  existing: {
    propertyType: string;
    purpose: string;
    area: string;
    excludeArea: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    yieldMin: number | null;
    landAreaMin: number | null;
    buildingAreaMin: number | null;
    maxAge: number | null;
    structure: string | null;
    parking: string | null;
    urgency: string;
    notes: string | null;
    member: { companyName: string; contactName: string; category: string };
  }
): boolean {
  const newData = sheetRowToRequestData(row);
  if (newData.propertyType !== existing.propertyType) return true;
  if (newData.purpose !== existing.purpose) return true;
  if (newData.area !== existing.area) return true;
  if ((newData.excludeArea || null) !== (existing.excludeArea || null)) return true;
  if (newData.budgetMin !== existing.budgetMin) return true;
  if (newData.budgetMax !== existing.budgetMax) return true;
  if (newData.yieldMin !== existing.yieldMin) return true;
  if (newData.landAreaMin !== existing.landAreaMin) return true;
  if (newData.buildingAreaMin !== existing.buildingAreaMin) return true;
  if (newData.maxAge !== existing.maxAge) return true;
  if ((newData.structure || null) !== (existing.structure || null)) return true;
  if ((newData.parking || null) !== (existing.parking || null)) return true;
  if (newData.urgency !== existing.urgency) return true;
  if ((newData.notes || null) !== (existing.notes || null)) return true;
  // 会員情報の差分
  if ((row.companyName || "（未入力）") !== existing.member.companyName) return true;
  if ((row.contactName || "（未入力）") !== existing.member.contactName) return true;
  if ((row.category || "その他") !== existing.member.category) return true;
  return false;
}

// --- スプレッドシート → HP 同期（差分更新 + 削除同期） ---
export async function syncFromSheet(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    deleted: 0,
    skipped: 0,
    errors: [],
    message: "",
  };

  try {
    const rows = await readSheetRequests();

    // シートに存在するHP_IDを収集（削除検知用）
    const sheetHpIds = new Set<string>();
    for (const row of rows) {
      if (row.hpId) sheetHpIds.add(row.hpId);
    }

    // HP側で削除済みのレコードに対応するシート行を収集
    const sheetRowsToDelete = new Map<string, number[]>();

    // --- 1) 新規取込 & 差分更新 ---
    for (const row of rows) {
      // タイムスタンプがない行はスキップ
      if (!row.timestamp) {
        result.skipped++;
        continue;
      }

      // HP_IDあり → DB照会して差分更新 or HP側削除済み→シートからも削除
      let needsImport = !row.hpId; // HP_IDなし = 新規取込対象

      if (row.hpId) {
        try {
          const existing = await prisma.propertyRequest.findUnique({
            where: { id: row.hpId },
            include: { member: true },
          });

          if (!existing) {
            // HP側で削除済み → シートからも削除（行番号を記録）
            if (!sheetRowsToDelete.has(row.sheetName)) {
              sheetRowsToDelete.set(row.sheetName, []);
            }
            sheetRowsToDelete.get(row.sheetName)!.push(row.rowIndex);
            result.deleted++;
            continue; // この行はスキップ
          } else if (hasChanges(row, existing)) {
            // 差分あり → 更新
            const requestData = sheetRowToRequestData(row);
            await prisma.propertyRequest.update({
              where: { id: row.hpId },
              data: {
                ...requestData,
                sheetRowIndex: row.rowIndex,
                syncedAt: new Date(),
              },
            });
            // 会員情報も更新
            await prisma.member.update({
              where: { id: existing.memberId },
              data: {
                companyName: row.companyName || "（未入力）",
                contactName: row.contactName || "（未入力）",
                category: row.category || "その他",
              },
            });
            result.updated++;
          } else {
            result.skipped++;
          }
        } catch (err) {
          const msg = `更新エラー(${row.hpId}): ${err instanceof Error ? err.message : "不明なエラー"}`;
          result.errors.push(msg);
        }
      }

      // 新規取込（HP_IDなし or 孤立HP_IDで再取込）
      if (needsImport) {
        try {
          const email = row.email || `form-${row.rowIndex}@sheet-import.local`;
          let member = await prisma.member.findUnique({ where: { email } });

          if (!member) {
            const dummyPassword = await bcrypt.hash(
              `sheet-import-${Date.now()}`,
              10
            );
            member = await prisma.member.create({
              data: {
                email,
                password: dummyPassword,
                companyName: row.companyName || "（未入力）",
                contactName: row.contactName || "（未入力）",
                category: row.category || "その他",
                isFormSubmission: true,
              },
            });
          }

          const requestData = sheetRowToRequestData(row);
          const request = await prisma.propertyRequest.create({
            data: {
              memberId: member.id,
              ...requestData,
              sheetRowIndex: row.rowIndex,
              syncedAt: new Date(),
            },
          });

          await writeHpIdToSheet(row.rowIndex, request.id, row.sheetName);
          sheetHpIds.add(request.id); // 削除ロジックで誤削除されないよう追加
          result.imported++;
        } catch (err) {
          const msg = `行${row.rowIndex}: ${err instanceof Error ? err.message : "不明なエラー"}`;
          result.errors.push(msg);
        }
      }
    }

    // --- 1.5) HP側で削除済みのレコードをシートからも削除 ---
    for (const [sheetName, rowIndices] of sheetRowsToDelete.entries()) {
      try {
        await deleteSheetRows(sheetName, rowIndices);
      } catch (err) {
        const msg = `シート行削除エラー(${sheetName}): ${err instanceof Error ? err.message : "不明なエラー"}`;
        result.errors.push(msg);
      }
    }

    // --- 2) 削除同期: シートから消えた行をHP側からも削除 ---
    try {
      const sheetSyncedRequests = await prisma.propertyRequest.findMany({
        where: { syncSource: "sheet" },
        select: { id: true },
      });

      for (const req of sheetSyncedRequests) {
        if (!sheetHpIds.has(req.id)) {
          // シートに存在しない → HP側も削除
          await prisma.requestNote.deleteMany({
            where: { requestId: req.id },
          });
          await prisma.propertyRequest.delete({
            where: { id: req.id },
          });
          result.deleted++;
        }
      }

      // 削除後、リクエストが0件になったフォーム会員も削除
      const orphanMembers = await prisma.member.findMany({
        where: {
          isFormSubmission: true,
          requests: { none: {} },
        },
        select: { id: true },
      });
      for (const m of orphanMembers) {
        await prisma.member.delete({ where: { id: m.id } });
      }
    } catch (err) {
      const msg = `削除同期エラー: ${err instanceof Error ? err.message : "不明なエラー"}`;
      result.errors.push(msg);
    }

    result.success = true;
    const parts = [];
    if (result.imported > 0) parts.push(`${result.imported}件取込`);
    if (result.updated > 0) parts.push(`${result.updated}件更新`);
    if (result.deleted > 0) parts.push(`${result.deleted}件削除`);
    if (result.skipped > 0) parts.push(`${result.skipped}件スキップ`);
    result.message = `同期完了: ${parts.join("、") || "変更なし"}`;
    if (result.errors.length > 0) {
      result.message += `、${result.errors.length}件エラー`;
    }
  } catch (err) {
    result.message = `同期失敗: ${err instanceof Error ? err.message : "不明なエラー"}`;
  }

  return result;
}

// --- HP → スプレッドシート 未同期レコードの再同期 ---
export async function resyncToSheet(): Promise<SyncResult> {
  const { appendRequestToSheet } = await import("@/lib/sheets");

  const result: SyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    deleted: 0,
    skipped: 0,
    errors: [],
    message: "",
  };

  try {
    // syncedAtがnullで、syncSourceが"hp"またはnullのレコード
    const unsyncedRequests = await prisma.propertyRequest.findMany({
      where: {
        syncedAt: null,
      },
      include: { member: true },
    });

    for (const req of unsyncedRequests) {
      try {
        const sheetRowIndex = await appendRequestToSheet(req, req.member);
        await prisma.propertyRequest.update({
          where: { id: req.id },
          data: {
            syncSource: "hp",
            sheetRowIndex: sheetRowIndex || null,
            syncedAt: new Date(),
          },
        });
        result.imported++;
      } catch (err) {
        const msg = `${req.id}: ${err instanceof Error ? err.message : "不明なエラー"}`;
        result.errors.push(msg);
      }
    }

    result.success = true;
    result.message = `再同期完了: ${result.imported}件同期`;
    if (result.errors.length > 0) {
      result.message += `、${result.errors.length}件エラー`;
    }
  } catch (err) {
    result.message = `再同期失敗: ${err instanceof Error ? err.message : "不明なエラー"}`;
  }

  return result;
}

// --- HP → スプレッドシート 全件再同期（同期済み含む） ---
export async function resyncAllToSheet(): Promise<SyncResult> {
  const { appendRequestToSheet, updateSheetRow } = await import("@/lib/sheets");

  const result: SyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    deleted: 0,
    skipped: 0,
    errors: [],
    message: "",
  };

  try {
    const allRequests = await prisma.propertyRequest.findMany({
      include: { member: true },
      orderBy: { createdAt: "asc" },
    });

    for (const req of allRequests) {
      try {
        if (req.sheetRowIndex) {
          // 既存行を更新
          await updateSheetRow(
            req.sheetRowIndex,
            req.syncSource,
            {
              id: req.id,
              propertyType: req.propertyType,
              purpose: req.purpose,
              area: req.area,
              excludeArea: req.excludeArea,
              budgetMin: req.budgetMin,
              budgetMax: req.budgetMax,
              yieldMin: req.yieldMin,
              landAreaMin: req.landAreaMin,
              buildingAreaMin: req.buildingAreaMin,
              maxAge: req.maxAge,
              structure: req.structure,
              parking: req.parking,
              urgency: req.urgency,
              notes: req.notes,
              delegateInfo: req.delegateInfo,
              createdAt: req.createdAt,
            },
            req.member,
          );
          result.updated++;
        } else {
          // sheetRowIndexなし → 新規追記
          const sheetRowIndex = await appendRequestToSheet(req, req.member);
          await prisma.propertyRequest.update({
            where: { id: req.id },
            data: {
              syncSource: req.syncSource || "hp",
              sheetRowIndex: sheetRowIndex || null,
              syncedAt: new Date(),
            },
          });
          result.imported++;
        }
      } catch (err) {
        const msg = `${req.id}: ${err instanceof Error ? err.message : "不明なエラー"}`;
        result.errors.push(msg);
      }
    }

    result.success = true;
    const parts = [];
    if (result.updated > 0) parts.push(`${result.updated}件更新`);
    if (result.imported > 0) parts.push(`${result.imported}件追記`);
    result.message = `全件再同期完了: ${parts.join("、") || "変更なし"}`;
    if (result.errors.length > 0) {
      result.message += `、${result.errors.length}件エラー`;
    }
  } catch (err) {
    result.message = `全件再同期失敗: ${err instanceof Error ? err.message : "不明なエラー"}`;
  }

  return result;
}

// --- 接続テスト ---
export async function testConnection(): Promise<ConnectionTestResult> {
  return await testSheetConnection();
}

// --- 同期ステータス取得 ---
export async function getSyncStatus() {
  const totalRequests = await prisma.propertyRequest.count();
  const syncedCount = await prisma.propertyRequest.count({
    where: { syncedAt: { not: null } },
  });
  const unsyncedCount = await prisma.propertyRequest.count({
    where: { syncedAt: null },
  });
  const fromSheet = await prisma.propertyRequest.count({
    where: { syncSource: "sheet" },
  });
  const fromHp = await prisma.propertyRequest.count({
    where: { syncSource: "hp" },
  });
  const formMembers = await prisma.member.count({
    where: { isFormSubmission: true },
  });

  return {
    totalRequests,
    syncedCount,
    unsyncedCount,
    fromSheet,
    fromHp,
    formMembers,
  };
}
