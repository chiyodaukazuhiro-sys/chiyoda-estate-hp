/**
 * 会員削除スクリプト
 *
 * 使い方:
 *   node scripts/delete-member.js                  → 全会員一覧を表示
 *   node scripts/delete-member.js <会員ID>         → 指定IDの会員を削除（確認あり）
 *   node scripts/delete-member.js <会員ID> --force  → 確認なしで削除
 *   node scripts/delete-member.js --search <キーワード> → 会社名・担当者名で検索
 */

const Database = require("better-sqlite3");
const path = require("path");
const readline = require("readline");

const DB_PATH = path.join(__dirname, "..", "prisma", "dev.db");

function getDb() {
  return new Database(DB_PATH);
}

function listMembers(searchQuery) {
  const db = getDb();
  let members;

  if (searchQuery) {
    members = db
      .prepare(
        `SELECT m.id, m.companyName, m.contactName, m.email, m.category, m.isFormSubmission, m.createdAt,
                (SELECT COUNT(*) FROM PropertyRequest WHERE memberId = m.id) as requestCount
         FROM Member m
         WHERE m.companyName LIKE ? OR m.contactName LIKE ? OR m.email LIKE ?
         ORDER BY m.createdAt DESC`
      )
      .all(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    console.log(`\n=== 検索結果: "${searchQuery}" (${members.length}件) ===\n`);
  } else {
    members = db
      .prepare(
        `SELECT m.id, m.companyName, m.contactName, m.email, m.category, m.isFormSubmission, m.createdAt,
                (SELECT COUNT(*) FROM PropertyRequest WHERE memberId = m.id) as requestCount
         FROM Member m
         ORDER BY m.createdAt DESC`
      )
      .all();
    console.log(`\n=== 会員一覧 (${members.length}件) ===\n`);
  }

  if (members.length === 0) {
    console.log("該当する会員がいません。");
    db.close();
    return;
  }

  members.forEach((m, i) => {
    const source = m.isFormSubmission ? "[フォーム]" : "[HP]";
    const date = new Date(m.createdAt).toLocaleDateString("ja-JP");
    console.log(
      `${i + 1}. ${source} ${m.companyName} / ${m.contactName} (${m.category})`
    );
    console.log(
      `   ID: ${m.id}  |  ${m.email}  |  登録: ${date}  |  リクエスト: ${m.requestCount}件`
    );
    console.log("");
  });

  console.log("削除するには: node scripts/delete-member.js <会員ID>");
  db.close();
}

function deleteMember(memberId, force) {
  const db = getDb();

  const member = db
    .prepare(
      `SELECT m.*, (SELECT COUNT(*) FROM PropertyRequest WHERE memberId = m.id) as requestCount
       FROM Member m WHERE m.id = ?`
    )
    .get(memberId);

  if (!member) {
    console.error(`\n❌ 会員ID "${memberId}" が見つかりません。`);
    db.close();
    process.exit(1);
  }

  const source = member.isFormSubmission ? "[フォーム]" : "[HP]";
  console.log(`\n=== 削除対象 ===`);
  console.log(`${source} ${member.companyName} / ${member.contactName}`);
  console.log(`業種: ${member.category}  |  メール: ${member.email}`);
  console.log(`リクエスト: ${member.requestCount}件`);
  console.log(`ID: ${member.id}\n`);

  if (member.requestCount > 0) {
    console.log(
      `⚠️  この会員には ${member.requestCount}件のリクエストがあります。リクエストも全て削除されます。`
    );
  }

  if (force) {
    executeDelete(db, memberId, member);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("本当に削除しますか？ (y/N): ", (answer) => {
      if (answer.toLowerCase() === "y") {
        executeDelete(db, memberId, member);
      } else {
        console.log("キャンセルしました。");
      }
      rl.close();
      db.close();
    });
  }
}

function executeDelete(db, memberId, member) {
  // RequestNoteを先に削除（外部キー制約）
  const noteResult = db
    .prepare(
      `DELETE FROM RequestNote WHERE requestId IN (SELECT id FROM PropertyRequest WHERE memberId = ?)`
    )
    .run(memberId);

  // PropertyRequestを削除
  const reqResult = db
    .prepare(`DELETE FROM PropertyRequest WHERE memberId = ?`)
    .run(memberId);

  // Memberを削除
  const memResult = db.prepare(`DELETE FROM Member WHERE id = ?`).run(memberId);

  console.log(
    `✅ 削除完了: ${member.companyName} / ${member.contactName}`
  );
  console.log(
    `   会員: ${memResult.changes}件, リクエスト: ${reqResult.changes}件, メモ: ${noteResult.changes}件 削除`
  );
}

// --- メイン ---
const args = process.argv.slice(2);

if (args.length === 0) {
  listMembers();
} else if (args[0] === "--search" && args[1]) {
  listMembers(args[1]);
} else {
  const memberId = args[0];
  const force = args.includes("--force");
  deleteMember(memberId, force);
}
