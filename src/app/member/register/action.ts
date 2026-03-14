"use server";

import { prisma } from "@/lib/db";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export type RegisterState = {
  success: boolean;
  error?: string;
};

export async function registerMember(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const companyName = formData.get("companyName") as string;
  const contactName = formData.get("contactName") as string;
  const category = formData.get("category") as string;
  const phone = (formData.get("phone") as string) || undefined;
  const searchType = (formData.get("searchType") as string) || undefined;

  if (!email || !password || !companyName || !contactName || !category) {
    return { success: false, error: "必須項目を入力してください。" };
  }

  if (password.length < 6) {
    return { success: false, error: "パスワードは6文字以上で設定してください。" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "パスワードが一致しません。" };
  }

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "このメールアドレスは既に登録されています。" };
  }

  const hashed = await hashPassword(password);
  const member = await prisma.member.create({
    data: { email, password: hashed, companyName, contactName, category, phone, searchType },
  });

  const token = await createToken(member.id);
  await setAuthCookie(token);

  redirect("/member/request");
}
