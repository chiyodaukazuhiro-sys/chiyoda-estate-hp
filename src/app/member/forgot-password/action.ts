"use server";

import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

export type ForgotPasswordState = {
  success: boolean;
  error?: string;
};

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "メールアドレスを入力してください。" };
  }

  const member = await prisma.member.findUnique({ where: { email } });

  // セキュリティ: メールが存在しなくても同じメッセージを返す
  if (!member) {
    return { success: true };
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1時間有効

  await prisma.passwordReset.create({
    data: {
      memberId: member.id,
      token,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/member/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailBody = `
${member.contactName} 様

チヨダエステートの会員パスワードリセットのリクエストを受け付けました。
下記のリンクから新しいパスワードを設定してください。

${resetUrl}

※このリンクは1時間有効です。
※心当たりのない場合は、このメールを無視してください。

──────────────────
チヨダエステート株式会社
TEL: 06-6539-7611
`.trim();

  try {
    await transporter.sendMail({
      from: `"チヨダエステート" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "【チヨダエステート】パスワード再設定のご案内",
      text: mailBody,
    });
  } catch (err) {
    console.error("Password reset email error:", err);
    return {
      success: false,
      error: "メールの送信に失敗しました。お手数ですがお電話にてお問い合わせください。",
    };
  }

  return { success: true };
}
