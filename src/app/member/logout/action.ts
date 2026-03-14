"use server";

import { removeAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logoutMember() {
  await removeAuthCookie();
  redirect("/member/login");
}
