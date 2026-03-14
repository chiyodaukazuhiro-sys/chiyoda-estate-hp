"use server";

import { createAdminToken, setAdminCookie } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export type AdminLoginState = {
  success: boolean;
  error?: string;
};

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = formData.get("password") as string;

  if (!password) {
    return { success: false, error: "パスワードを入力してください。" };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    return { success: false, error: "パスワードが正しくありません。" };
  }

  const token = await createAdminToken();
  await setAdminCookie(token);
  redirect("/admin");
}
