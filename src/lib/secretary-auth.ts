import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "chiyoda-estate-member-secret-key-2024"
);
const COOKIE_NAME = "secretary-token";

export async function createSecretaryToken() {
  return new SignJWT({ role: "secretary" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifySecretaryToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "secretary";
  } catch {
    return false;
  }
}

export async function setSecretaryCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSecretaryCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function removeSecretaryCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isSecretary() {
  const token = await getSecretaryCookie();
  if (!token) return false;
  return verifySecretaryToken(token);
}
