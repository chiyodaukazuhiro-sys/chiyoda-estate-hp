"use server";

import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";
import { appendRequestToSheet, deleteSheetRows, updateSheetRow } from "@/lib/sheets";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

export type RequestState = {
  success: boolean;
  error?: string;
};

export async function submitPropertyRequest(
  _prev: RequestState,
  formData: FormData
): Promise<RequestState> {
  const auth = await getCurrentMember();
  if (!auth) {
    return { success: false, error: "ログインが必要です。" };
  }

  const propertyTypes = formData.getAll("propertyType") as string[];
  const purpose = formData.get("purpose") as string;
  const area = formData.get("area") as string;
  const excludeArea = (formData.get("excludeArea") as string) || undefined;
  const budgetMin = formData.get("budgetMin") ? Number(formData.get("budgetMin")) : undefined;
  const budgetMax = formData.get("budgetMax") ? Number(formData.get("budgetMax")) : undefined;
  const yieldMin = formData.get("yieldMin") ? Number(formData.get("yieldMin")) : undefined;
  const landAreaMin = formData.get("landAreaMin") ? Number(formData.get("landAreaMin")) : undefined;
  const buildingAreaMin = formData.get("buildingAreaMin") ? Number(formData.get("buildingAreaMin")) : undefined;
  const maxAge = formData.get("maxAge") ? Number(formData.get("maxAge")) : undefined;
  const structure = (formData.get("structure") as string) || undefined;
  const parking = (formData.get("parking") as string) || undefined;
  const urgency = formData.get("urgency") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const delegateInfo = (formData.get("delegateInfo") as string) || undefined;

  if (propertyTypes.length === 0 || !purpose || !area || !urgency) {
    return { success: false, error: "必須項目を入力してください。" };
  }

  const propertyType = propertyTypes.join(",");

  const request = await prisma.propertyRequest.create({
    data: {
      memberId: auth.memberId,
      propertyType,
      purpose,
      area,
      excludeArea,
      budgetMin,
      budgetMax,
      yieldMin,
      landAreaMin,
      buildingAreaMin,
      maxAge,
      structure,
      parking,
      urgency,
      notes,
      delegateInfo,
    },
  });

  // Send email notification
  const member = await prisma.member.findUnique({ where: { id: auth.memberId } });
  if (member) {
    const fmt = (v: number | null | undefined, unit: string) =>
      v != null ? `${v.toLocaleString()}${unit}` : "指定なし";

    const mailBody = `
【物件リクエスト】${member.contactName}様（${member.category}）
会社名: ${member.companyName}
メール: ${member.email}
電話: ${member.phone || "未登録"}
${delegateInfo ? `委任先: ${delegateInfo}` : ""}
━━━ 物件リクエスト条件 ━━━

■ 物件種別: ${propertyType.replace(/,/g, " / ")}
■ 利用目的: ${purpose}
■ 希望エリア: ${area}
■ 除外エリア: ${excludeArea || "なし"}
■ 予算: ${fmt(budgetMin, "万円")} ～ ${fmt(budgetMax, "万円")}
■ 希望利回り: ${yieldMin ? `${yieldMin}%以上` : "指定なし"}
■ 土地面積: ${fmt(landAreaMin, "㎡以上")}
■ 建物面積: ${fmt(buildingAreaMin, "㎡以上")}
■ 築年数: ${maxAge ? `${maxAge}年以内` : "指定なし"}
■ 構造: ${structure || "指定なし"}
■ 駐車場: ${parking || "指定なし"}
■ 緊急度: ${urgency}

■ その他要望:
${notes || "なし"}

━━━━━━━━━━━━━━━━
リクエストID: ${request.id}
送信日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
`.trim();

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"チヨダエステート HP" <${process.env.GMAIL_USER}>`,
        to: "chiyoda.u.kazuhiro@gmail.com",
        subject: `【物件リクエスト】${member.contactName}様（${member.category}）- ${propertyType.replace(/,/g, "・")}`,
        text: mailBody,
      });
    } catch (err) {
      console.error("Email send error:", err);
      // Don't fail the request if email fails - data is saved in DB
    }

    // Sync to Google Sheet (fire-and-forget)
    try {
      const sheetRowIndex = await appendRequestToSheet(request, member);
      await prisma.propertyRequest.update({
        where: { id: request.id },
        data: {
          syncSource: "hp",
          sheetRowIndex: sheetRowIndex || null,
          syncedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("Sheet sync error:", err);
      // Don't fail the request if sheet sync fails - data is saved in DB
    }
  }

  return { success: true };
}

// --- リクエスト削除 ---
export async function deleteRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await getCurrentMember();
  if (!auth) {
    return { success: false, error: "ログインが必要です。" };
  }

  // リクエストが本人のものか確認
  const request = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    select: { memberId: true, sheetRowIndex: true, syncSource: true },
  });

  if (!request) {
    return { success: false, error: "リクエストが見つかりません。" };
  }

  if (request.memberId !== auth.memberId) {
    return { success: false, error: "このリクエストを削除する権限がありません。" };
  }

  // Google Sheetから該当行を削除（sync済みの場合）
  if (request.sheetRowIndex) {
    try {
      const sheetName = request.syncSource === "sheet" ? "フォームの回答 1" : "フォームの回答 2";
      await deleteSheetRows(sheetName, [request.sheetRowIndex]);
    } catch (err) {
      console.error("Sheet row delete error:", err);
      // シート削除失敗してもDB削除は続行
    }
  }

  // RequestNote → PropertyRequest の順で削除（FK制約対応）
  await prisma.requestNote.deleteMany({
    where: { requestId },
  });
  await prisma.propertyRequest.delete({
    where: { id: requestId },
  });

  revalidatePath("/member");
  revalidatePath("/admin/requests");
  revalidatePath("/admin");

  return { success: true };
}

// --- リクエスト更新（会員用） ---
export type MemberEditState = {
  success: boolean;
  error?: string;
};

export async function updateMemberRequest(
  _prev: MemberEditState,
  formData: FormData,
): Promise<MemberEditState> {
  const auth = await getCurrentMember();
  if (!auth) {
    return { success: false, error: "ログインが必要です。" };
  }

  const requestId = formData.get("requestId") as string;
  if (!requestId) {
    return { success: false, error: "リクエストIDが不正です。" };
  }

  // 本人確認
  const existing = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    select: { memberId: true },
  });
  if (!existing) {
    return { success: false, error: "リクエストが見つかりません。" };
  }
  if (existing.memberId !== auth.memberId) {
    return { success: false, error: "このリクエストを編集する権限がありません。" };
  }

  const area = (formData.get("area") as string)?.trim();
  const excludeArea = (formData.get("excludeArea") as string)?.trim() || null;
  const budgetMinRaw = formData.get("budgetMin") as string;
  const budgetMaxRaw = formData.get("budgetMax") as string;
  const yieldMinRaw = formData.get("yieldMin") as string;
  const landAreaMinRaw = formData.get("landAreaMin") as string;
  const buildingAreaMinRaw = formData.get("buildingAreaMin") as string;
  const maxAgeRaw = formData.get("maxAge") as string;
  const structure = (formData.get("structure") as string)?.trim() || null;
  const parking = (formData.get("parking") as string)?.trim() || null;
  const propertyType = (formData.get("propertyType") as string)?.trim();
  const purpose = (formData.get("purpose") as string)?.trim();
  const urgency = (formData.get("urgency") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const delegateInfo = (formData.get("delegateInfo") as string)?.trim() || null;

  if (!area || !propertyType || !purpose || !urgency) {
    return { success: false, error: "必須項目を入力してください。" };
  }

  const updatedData = {
    propertyType,
    purpose,
    area,
    excludeArea,
    budgetMin: budgetMinRaw ? parseInt(budgetMinRaw) : null,
    budgetMax: budgetMaxRaw ? parseInt(budgetMaxRaw) : null,
    yieldMin: yieldMinRaw ? parseFloat(yieldMinRaw) : null,
    landAreaMin: landAreaMinRaw ? parseInt(landAreaMinRaw) : null,
    buildingAreaMin: buildingAreaMinRaw ? parseInt(buildingAreaMinRaw) : null,
    maxAge: maxAgeRaw ? parseInt(maxAgeRaw) : null,
    structure,
    parking,
    urgency,
    notes,
    delegateInfo,
  };

  await prisma.propertyRequest.update({
    where: { id: requestId },
    data: updatedData,
  });

  // include を分離して取得（Neon HTTP アダプタはトランザクション非対応のため）
  const updatedRequest = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    include: { member: true },
  });

  // シート同期（sheetRowIndexがある場合は差分更新）
  if (updatedRequest?.sheetRowIndex) {
    try {
      await updateSheetRow(
        updatedRequest.sheetRowIndex,
        updatedRequest.syncSource,
        {
          id: updatedRequest.id,
          propertyType: updatedRequest.propertyType,
          purpose: updatedRequest.purpose,
          area: updatedRequest.area,
          excludeArea: updatedRequest.excludeArea,
          budgetMin: updatedRequest.budgetMin,
          budgetMax: updatedRequest.budgetMax,
          yieldMin: updatedRequest.yieldMin,
          landAreaMin: updatedRequest.landAreaMin,
          buildingAreaMin: updatedRequest.buildingAreaMin,
          maxAge: updatedRequest.maxAge,
          structure: updatedRequest.structure,
          parking: updatedRequest.parking,
          urgency: updatedRequest.urgency,
          notes: updatedRequest.notes,
          delegateInfo: updatedRequest.delegateInfo,
          createdAt: updatedRequest.createdAt,
        },
        updatedRequest.member,
      );
    } catch (err) {
      console.error("Sheet sync error on update:", err);
    }
  }

  revalidatePath(`/member/request/${requestId}`);
  revalidatePath("/member");
  revalidatePath("/admin/requests");
  revalidatePath("/admin");

  return { success: true };
}
