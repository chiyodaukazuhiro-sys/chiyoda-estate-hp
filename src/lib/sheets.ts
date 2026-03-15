import { google, sheets_v4 } from "googleapis";

// --- 定数 ---
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "";
const SHEET_NAMES = ["フォームの回答 1", "フォームの回答 2"];
const HP_ID_HEADER = "HP_ID";

// --- 認証 ---
function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Google認証情報が設定されていません。.env.localにGOOGLE_SERVICE_ACCOUNT_EMAILとGOOGLE_PRIVATE_KEYを設定してください。"
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient(): sheets_v4.Sheets {
  return google.sheets({ version: "v4", auth: getAuth() });
}

// --- 型定義 ---
export interface SheetRow {
  rowIndex: number; // 1-based (ヘッダー=1, データは2〜)
  sheetName: string; // どのシートタブから来たか
  timestamp: string;
  email: string;
  companyName: string;
  contactName: string;
  category: string;
  propertyType: string;
  purpose: string;
  area: string;
  excludeArea: string;
  budgetMin: string;
  budgetMax: string;
  yieldMin: string;
  landAreaMin: string;
  buildingAreaMin: string;
  maxAge: string;
  structure: string;
  parking: string;
  urgency: string;
  notes: string;
  delegateInfo: string;
  hpId: string;
}

// --- 動的ヘッダーマッピング ---
// ヘッダー名からカラムインデックスを検索（左側優先: 簡易フォーム列にデータがあるため）
function findColumnIndex(headers: string[], ...patterns: string[]): number {
  for (const pattern of patterns) {
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].includes(pattern)) return i;
    }
  }
  return -1;
}

interface ColumnMap {
  timestamp: number;
  email: number;
  companyName: number;
  contactName: number;
  category: number;
  propertyType: number;
  purpose: number;
  area: number;
  excludeArea: number;
  budgetMin: number;
  budgetMax: number;
  yieldMin: number;
  landAreaMin: number;
  buildingAreaMin: number;
  maxAge: number;
  structure: number;
  parking: number;
  urgency: number;
  notes: number;
  delegateInfo: number;
  hpId: number;
}

function buildColumnMap(headers: string[]): ColumnMap {
  return {
    timestamp: findColumnIndex(headers, "タイムスタンプ"),
    email: findColumnIndex(headers, "メールアドレス"),
    companyName: findColumnIndex(headers, "会社名"),
    contactName: findColumnIndex(headers, "ご担当者名"),
    category: findColumnIndex(headers, "顧客情報"),
    propertyType: findColumnIndex(headers, "希望条件", "物件種別"),
    purpose: findColumnIndex(headers, "利用目的"),
    area: findColumnIndex(headers, "エリア", "希望エリア"),
    excludeArea: findColumnIndex(headers, "除外エリア"),
    budgetMin: findColumnIndex(headers, "予算下限"),
    budgetMax: findColumnIndex(headers, "購入予算", "予算上限"),
    yieldMin: findColumnIndex(headers, "利回り"),
    landAreaMin: findColumnIndex(headers, "希望面積（土地", "土地面積"),
    buildingAreaMin: findColumnIndex(headers, "希望面積（建物", "建物面積"),
    maxAge: findColumnIndex(headers, "築年数"),
    structure: findColumnIndex(headers, "構造"),
    parking: findColumnIndex(headers, "駐車場"),
    urgency: findColumnIndex(headers, "緊急度"),
    notes: findColumnIndex(headers, "その他こだわり", "その他ご要望"),
    delegateInfo: findColumnIndex(headers, "委任先"),
    hpId: findColumnIndex(headers, HP_ID_HEADER),
  };
}

// カラムインデックス → 列文字変換 (0=A, 1=B, ..., 25=Z, 26=AA, ...)
function colIndexToLetter(index: number): string {
  let letter = "";
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

// セル値取得ヘルパー（index=-1なら空文字を返す）
function getCell(row: string[], index: number): string {
  if (index < 0 || index >= row.length) return "";
  return row[index] || "";
}

// --- キャッシュ: ヘッダー情報（シートごと） ---
const headerCache = new Map<string, { headers: string[]; colMap: ColumnMap; totalColumns: number }>();

async function loadHeaders(sheetName: string): Promise<{ headers: string[]; colMap: ColumnMap; totalColumns: number }> {
  const cached = headerCache.get(sheetName);
  if (cached) return cached;

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!1:1`,
  });

  const headers = (response.data.values?.[0] || []) as string[];
  const colMap = buildColumnMap(headers);
  const totalColumns = headers.length;

  const result = { headers, colMap, totalColumns };
  headerCache.set(sheetName, result);
  return result;
}

// キャッシュクリア（HP_ID列追加後に必要）
function clearHeaderCache(sheetName?: string) {
  if (sheetName) {
    headerCache.delete(sheetName);
  } else {
    headerCache.clear();
  }
}

// --- HP_ID列の確保（シートごと） ---
async function ensureHpIdColumn(sheetName: string): Promise<{ colMap: ColumnMap; hpIdColLetter: string }> {
  let { colMap, totalColumns } = await loadHeaders(sheetName);

  if (colMap.hpId >= 0) {
    return { colMap, hpIdColLetter: colIndexToLetter(colMap.hpId) };
  }

  // HP_ID列が存在しない → 最後の列の次に追加
  const sheets = getSheetsClient();
  const newColIndex = totalColumns;
  const newColLetter = colIndexToLetter(newColIndex);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!${newColLetter}1`,
    valueInputOption: "RAW",
    requestBody: { values: [[HP_ID_HEADER]] },
  });

  clearHeaderCache(sheetName);
  const reloaded = await loadHeaders(sheetName);
  colMap = reloaded.colMap;

  return { colMap, hpIdColLetter: newColLetter };
}

// --- 追加ヘッダー列の確保（汎用） ---
async function ensureColumn(sheetName: string, headerName: string, colMap: ColumnMap, colKey: keyof ColumnMap): Promise<ColumnMap> {
  if (colMap[colKey] >= 0) return colMap;

  const sheets = getSheetsClient();
  const { totalColumns } = await loadHeaders(sheetName);

  // 最後の列の次に追加
  const newColLetter = colIndexToLetter(totalColumns);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!${newColLetter}1`,
    valueInputOption: "RAW",
    requestBody: { values: [[headerName]] },
  });

  clearHeaderCache(sheetName);
  const reloaded = await loadHeaders(sheetName);
  return reloaded.colMap;
}

// --- 単一シートからの読み込み ---
async function readSheetTab(sheetName: string): Promise<SheetRow[]> {
  clearHeaderCache(sheetName); // 毎回最新ヘッダーを読む

  const { colMap } = await ensureHpIdColumn(sheetName);
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'`,
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return []; // ヘッダーのみ or 空

  // ヘッダー行をスキップして各データ行をパース
  return rows.slice(1).map((row, index) => ({
    rowIndex: index + 2, // 1-based, ヘッダー=1
    sheetName, // どのシートから来たか
    timestamp: getCell(row, colMap.timestamp),
    email: getCell(row, colMap.email),
    companyName: getCell(row, colMap.companyName),
    contactName: getCell(row, colMap.contactName),
    category: getCell(row, colMap.category),
    propertyType: getCell(row, colMap.propertyType),
    purpose: getCell(row, colMap.purpose),
    area: getCell(row, colMap.area),
    excludeArea: getCell(row, colMap.excludeArea),
    budgetMin: getCell(row, colMap.budgetMin),
    budgetMax: getCell(row, colMap.budgetMax),
    yieldMin: getCell(row, colMap.yieldMin),
    landAreaMin: getCell(row, colMap.landAreaMin),
    buildingAreaMin: getCell(row, colMap.buildingAreaMin),
    maxAge: getCell(row, colMap.maxAge),
    structure: getCell(row, colMap.structure),
    parking: getCell(row, colMap.parking),
    urgency: getCell(row, colMap.urgency),
    notes: getCell(row, colMap.notes),
    delegateInfo: getCell(row, colMap.delegateInfo),
    hpId: getCell(row, colMap.hpId),
  }));
}

// --- 全シートからの読み込み（複数タブ対応） ---
export async function readSheetRequests(): Promise<SheetRow[]> {
  const allRows: SheetRow[] = [];
  for (const sheetName of SHEET_NAMES) {
    try {
      const rows = await readSheetTab(sheetName);
      allRows.push(...rows);
    } catch (err) {
      console.error(`シート「${sheetName}」の読み込みエラー:`, err);
      // 存在しないシートはスキップ
    }
  }
  return allRows;
}

// --- HP_IDの書き戻し ---
export async function writeHpIdToSheet(
  rowIndex: number,
  hpId: string,
  sheetName: string = SHEET_NAMES[0]
): Promise<void> {
  const { hpIdColLetter } = await ensureHpIdColumn(sheetName);
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!${hpIdColLetter}${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[hpId]],
    },
  });
}

// --- シートの行を削除（HP側で削除されたレコードをシートからも削除） ---
export async function deleteSheetRows(
  sheetName: string,
  rowIndices: number[] // 1-based row indices
): Promise<void> {
  if (rowIndices.length === 0) return;

  const sheets = getSheetsClient();

  // シートの内部ID（gid）を取得
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error(`シート「${sheetName}」が見つかりません`);
  }
  const sheetId = sheet.properties.sheetId;

  // 下の行から削除（インデックスがずれないように降順ソート）
  const sorted = [...rowIndices].sort((a, b) => b - a);

  const requests = sorted.map((rowIndex) => ({
    deleteDimension: {
      range: {
        sheetId,
        dimension: "ROWS" as const,
        startIndex: rowIndex - 1, // 0-based
        endIndex: rowIndex, // exclusive
      },
    },
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests },
  });
}

// --- HPリクエストをシートに追記 ---
interface RequestForSheet {
  id: string;
  propertyType: string;
  purpose: string;
  area: string;
  excludeArea?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  yieldMin?: number | null;
  landAreaMin?: number | null;
  buildingAreaMin?: number | null;
  maxAge?: number | null;
  structure?: string | null;
  parking?: string | null;
  urgency: string;
  notes?: string | null;
  delegateInfo?: string | null;
  createdAt: Date;
}

interface MemberForSheet {
  email: string;
  companyName: string;
  contactName: string;
  category: string;
}

export async function appendRequestToSheet(
  request: RequestForSheet,
  member: MemberForSheet
): Promise<number> {
  // HP→シート書き込みは「フォームの回答 2」（詳細フォーム）に追記
  const writeSheetName = SHEET_NAMES[1] || SHEET_NAMES[0];
  let { colMap } = await ensureHpIdColumn(writeSheetName);
  colMap = await ensureColumn(writeSheetName, "委任先", colMap, "delegateInfo");
  const sheets = getSheetsClient();

  // ヘッダー数分の空配列を用意し、カラムマップに従って値をセット
  const hpIdIndex = colMap.hpId >= 0 ? colMap.hpId : 0;
  const rowSize = Math.max(hpIdIndex + 1, Object.values(colMap).reduce((max, v) => Math.max(max, v), 0) + 1);
  const row: string[] = new Array(rowSize).fill("");

  const now = new Date();
  const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  function setCol(index: number, value: string) {
    if (index >= 0 && index < row.length) row[index] = value;
  }

  setCol(colMap.timestamp, timestamp);
  setCol(colMap.email, member.email);
  setCol(colMap.companyName, member.companyName);
  setCol(colMap.contactName, member.contactName);
  setCol(colMap.category, member.category);
  setCol(colMap.propertyType, request.propertyType);
  setCol(colMap.purpose, request.purpose);
  setCol(colMap.area, request.area);
  setCol(colMap.excludeArea, request.excludeArea || "");
  setCol(colMap.budgetMin, request.budgetMin?.toString() || "");
  setCol(colMap.budgetMax, request.budgetMax?.toString() || "");
  setCol(colMap.yieldMin, request.yieldMin?.toString() || "");
  setCol(colMap.landAreaMin, request.landAreaMin?.toString() || "");
  setCol(colMap.buildingAreaMin, request.buildingAreaMin?.toString() || "");
  setCol(colMap.maxAge, request.maxAge?.toString() || "");
  setCol(colMap.structure, request.structure || "");
  setCol(colMap.parking, request.parking || "");
  setCol(colMap.urgency, request.urgency);
  setCol(colMap.notes, request.notes || "");
  setCol(colMap.delegateInfo, request.delegateInfo || "");
  setCol(colMap.hpId, request.id);

  const lastColLetter = colIndexToLetter(rowSize - 1);
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${writeSheetName}'!A:${lastColLetter}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [row],
    },
  });

  // 追加された行番号を返す
  const updatedRange = response.data.updates?.updatedRange || "";
  const match = updatedRange.match(/!A(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// --- ヘルパー: 全角→半角変換 ---
function toHalfWidth(str: string): string {
  return str
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/．/g, ".");
}

// --- ヘルパー: 文字列を数値に変換 ---
export function parseIntOrNull(value: string): number | null {
  if (!value || value.trim() === "") return null;
  // 全角数字を半角に変換してからパース
  const half = toHalfWidth(value);
  // 「～6,000万円迄」「10,000万円～」等のテキストをパース
  const cleaned = half.replace(/[,，～〜万円迄以上以下約㎡坪年]/g, "").trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

export function parseFloatOrNull(value: string): number | null {
  if (!value || value.trim() === "") return null;
  const half = toHalfWidth(value);
  const cleaned = half.replace(/[%％]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// --- シート行データをPropertyRequest作成用データに変換 ---
export function sheetRowToRequestData(row: SheetRow) {
  return {
    propertyType: row.propertyType || "未指定",
    purpose: row.purpose || "その他",
    area: row.area || "未指定",
    excludeArea: row.excludeArea || null,
    budgetMin: parseIntOrNull(row.budgetMin),
    budgetMax: parseIntOrNull(row.budgetMax),
    yieldMin: parseFloatOrNull(row.yieldMin),
    landAreaMin: parseIntOrNull(row.landAreaMin),
    buildingAreaMin: parseIntOrNull(row.buildingAreaMin),
    maxAge: parseIntOrNull(row.maxAge),
    structure: row.structure || null,
    parking: row.parking || null,
    urgency: row.urgency || "情報収集中",
    notes: row.notes || null,
    delegateInfo: row.delegateInfo || null,
    status: "新規",
    syncSource: "sheet" as const,
  };
}

// --- シート接続テスト ---
export async function testSheetConnection(): Promise<{
  success: boolean;
  message: string;
  rowCount?: number;
}> {
  try {
    const rows = await readSheetRequests();
    return {
      success: true,
      message: `接続成功: ${rows.length}件のデータを取得（シート: ${SHEET_NAMES.join("、")}）`,
      rowCount: rows.length,
    };
  } catch (error) {
    return {
      success: false,
      message: `接続失敗: ${error instanceof Error ? error.message : "不明なエラー"}`,
    };
  }
}
