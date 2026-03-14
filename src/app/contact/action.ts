"use server";

import nodemailer from "nodemailer";

type ContactFormState = {
  success: boolean;
  error?: string;
};

const INQUIRY_TYPES: Record<string, string> = {
  buy: "物件の購入について",
  sell: "物件の売却について",
  rent: "賃貸物件について",
  manage: "不動産管理について",
  consult: "コンサルティングについて",
  other: "その他",
};

export async function sendContactEmail(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || "未記入";
  const inquiryType = formData.get("inquiryType") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !inquiryType || !message) {
    return { success: false, error: "必須項目を入力してください。" };
  }

  const typeName = INQUIRY_TYPES[inquiryType] || inquiryType;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailBody = `
【お問い合わせフォームからの送信】

■ お名前: ${name}
■ メールアドレス: ${email}
■ 電話番号: ${phone}
■ お問い合わせ種別: ${typeName}

■ お問い合わせ内容:
${message}

──────────────────
このメールはチヨダエステートのホームページお問い合わせフォームから自動送信されています。
`.trim();

  try {
    await transporter.sendMail({
      from: `"チヨダエステート HP" <${process.env.GMAIL_USER}>`,
      to: "chiyoda.u.kazuhiro@gmail.com",
      replyTo: email,
      subject: `【HP問合せ】${typeName} - ${name}様`,
      text: mailBody,
    });

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return {
      success: false,
      error: "送信に失敗しました。お手数ですがお電話にてお問い合わせください。",
    };
  }
}
