"use server";

import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";

export type EditMemberState = {
  success: boolean;
  error?: string;
};

export async function updateMember(
  _prev: EditMemberState,
  formData: FormData
): Promise<EditMemberState> {
  const auth = await getCurrentMember();
  if (!auth) {
    return { success: false, error: "ログインしてください。" };
  }

  const companyName = formData.get("companyName") as string;
  const contactName = formData.get("contactName") as string;
  const category = formData.get("category") as string;
  const phone = (formData.get("phone") as string) || null;
  const searchType = (formData.get("searchType") as string) || null;

  if (!companyName || !contactName || !category) {
    return { success: false, error: "必須項目を入力してください。" };
  }

  await prisma.member.update({
    where: { id: auth.memberId },
    data: { companyName, contactName, category, phone, searchType },
  });

  return { success: true };
}
