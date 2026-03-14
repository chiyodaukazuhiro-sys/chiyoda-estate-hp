"use server";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export type ResetPasswordState = {
  success: boolean;
  error?: string;
};

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { success: false, error: "無効なリンクです。" };
  }

  if (!password || !confirmPassword) {
    return { success: false, error: "パスワードを入力してください。" };
  }

  if (password.length < 6) {
    return { success: false, error: "パスワードは6文字以上で設定してください。" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "パスワードが一致しません。" };
  }

  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
    return {
      success: false,
      error: "このリンクは無効または期限切れです。再度パスワードリセットをお申し込みください。",
    };
  }

  const hashed = await hashPassword(password);

  await prisma.$transaction([
    prisma.member.update({
      where: { id: resetRecord.memberId },
      data: { password: hashed },
    }),
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
  ]);

  return { success: true };
}
