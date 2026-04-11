import { NextRequest, NextResponse } from "next/server";
import { handleCallback } from "@/lib/google-tasks";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    await handleCallback(code);
    return NextResponse.redirect(
      new URL("/secretary?connected=true", request.url)
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/secretary?error=auth_failed", request.url)
    );
  }
}
