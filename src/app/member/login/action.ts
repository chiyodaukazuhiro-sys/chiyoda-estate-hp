"use server";

import { prisma } from "@/lib/db";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export type LoginState = {
  success: boolean;
  error?: string;
};

export async function loginMember(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "メールアドレスとパスワードを入力してください。" };
  }

  const member = await prisma.member.findUnique({ where: { email } });
  if (!member) {
    return { success: false, error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  const valid = await verifyPassword(password, member.password);
  if (!valid) {
    return { success: false, error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  const token = await createToken(member.id);
  await setAuthCookie(token);

  redirect("/member/request");
}
