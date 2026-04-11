"use server";

import { createSecretaryToken, setSecretaryCookie } from "@/lib/secretary-auth";
import { redirect } from "next/navigation";

export type SecretaryLoginState = {
  success: boolean;
  error?: string;
};

export async function secretaryLogin(
  _prev: SecretaryLoginState,
  formData: FormData
): Promise<SecretaryLoginState> {
  const pin = formData.get("pin") as string;

  if (!pin) {
    return { success: false, error: "PINを入力してください。" };
  }

  const secretaryPin = process.env.SECRETARY_PIN || "1234";
  if (pin !== secretaryPin) {
    return { success: false, error: "PINが正しくありません。" };
  }

  const token = await createSecretaryToken();
  await setSecretaryCookie(token);
  redirect("/secretary");
}
