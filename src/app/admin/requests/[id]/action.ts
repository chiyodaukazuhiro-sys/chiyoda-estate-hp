"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSheetRows, updateSheetRow } from "@/lib/sheets";

export type NoteActionState = {
  success: boolean;
  error?: string;
};

const STATUSES = ["新規", "対応中", "物件提案済", "成約", "見送り"] as const;

export async function addNote(
  _prev: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const requestId = formData.get("requestId") as string;
  const content = (formData.get("content") as string)?.trim();
  const statusRaw = formData.get("status") as string;

  if (!content) {
    return { success: false, error: "メモを入力してください。" };
  }

  const status = STATUSES.includes(statusRaw as (typeof STATUSES)[number])
    ? statusRaw
    : null;

  // Save note
  await prisma.requestNote.create({
    data: {
      requestId,
      content,
      status,
    },
  });

  // Update request status if changed
  if (status) {
    await prisma.propertyRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin");

  return { success: true };
}

export type EditActionState = {
  success: boolean;
  error?: string;
};

export async function updateRequest(
  _prev: EditActionState,
  formData: FormData,
): Promise<EditActionState> {
  const requestId = formData.get("requestId") as string;

  if (!requestId) {
    return { success: false, error: "リクエストIDが不正です。" };
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

  await prisma.propertyRequest.update({
    where: { id: requestId },
    data: {
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
    },
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

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin");

  return { success: true };
}

// --- リクエスト削除（管理者用） ---
export async function deleteAdminRequest(requestId: string): Promise<void> {
  const request = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    select: { sheetRowIndex: true, syncSource: true },
  });

  if (!request) return;

  // Google Sheetから該当行を削除
  if (request.sheetRowIndex) {
    try {
      const sheetName = request.syncSource === "sheet" ? "フォームの回答 1" : "フォームの回答 2";
      await deleteSheetRows(sheetName, [request.sheetRowIndex]);
    } catch (err) {
      console.error("Sheet row delete error:", err);
    }
  }

  // RequestNote → PropertyRequest の順で削除
  await prisma.requestNote.deleteMany({ where: { requestId } });
  await prisma.propertyRequest.delete({ where: { id: requestId } });

  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  revalidatePath("/member");

  redirect("/admin/requests");
}
