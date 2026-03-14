"use server";

import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export type AdminEditMemberState = {
  success: boolean;
  error?: string;
};

export async function adminUpdateMember(
  _prev: AdminEditMemberState,
  formData: FormData
): Promise<AdminEditMemberState> {
  if (!(await isAdmin())) {
    return { success: false, error: "管理者権限が必要です。" };
  }

  const memberId = formData.get("memberId") as string;
  const companyName = formData.get("companyName") as string;
  const contactName = formData.get("contactName") as string;
  const category = formData.get("category") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const searchType = (formData.get("searchType") as string) || null;

  if (!memberId || !companyName || !contactName || !category || !email) {
    return { success: false, error: "必須項目を入力してください。" };
  }

  const existing = await prisma.member.findUnique({ where: { id: memberId } });
  if (!existing) {
    return { success: false, error: "会員が見つかりません。" };
  }

  if (email !== existing.email) {
    const emailTaken = await prisma.member.findUnique({ where: { email } });
    if (emailTaken) {
      return { success: false, error: "このメールアドレスは既に使用されています。" };
    }
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { companyName, contactName, category, email, phone, searchType },
  });

  return { success: true };
}

export async function deleteMember(memberId: string) {
  // メモ → リクエスト → 会員の順に削除（外部キー制約）
  await prisma.requestNote.deleteMany({
    where: { request: { memberId } },
  });
  await prisma.propertyRequest.deleteMany({
    where: { memberId },
  });
  await prisma.member.delete({
    where: { id: memberId },
  });

  redirect("/admin/members");
}
