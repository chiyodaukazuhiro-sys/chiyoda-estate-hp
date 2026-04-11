import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "chiyoda-estate-member-secret-key-2024"
);

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

async function verifyAdmin(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set pathname header for layout to read
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Secretary login - no auth needed
  if (pathname.startsWith("/secretary/login")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Secretary routes - require secretary token
  if (pathname.startsWith("/secretary")) {
    const token = request.cookies.get("secretary-token")?.value;
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL("/secretary/login", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Admin login - no auth needed, just pass through with headers
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Admin routes - require admin token
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin-token")?.value;
    if (!token || !(await verifyAdmin(token))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Member routes
  const token = request.cookies.get("member-token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.redirect(new URL("/member/login", request.url));
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/member/request/:path*",
    "/member/edit/:path*",
    "/member/dashboard/:path*",
    "/admin/:path*",
    "/secretary/:path*",
  ],
};
