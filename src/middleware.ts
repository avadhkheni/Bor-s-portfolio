import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("portfolio_admin_session");

  // 1. Protect server-side mutation API endpoints (uploading and modifying site data)
  if (
    (pathname.startsWith("/api/upload") || pathname.startsWith("/api/content")) &&
    request.method === "POST"
  ) {
    const authHeader = request.headers.get("authorization");
    const token = sessionCookie?.value || authHeader?.replace("Bearer ", "");

    if (!token || !token.includes(".")) {
      return NextResponse.json(
        { error: "Access Denied: Strict 2FA Admin Authentication Required." },
        { status: 401 }
      );
    }
  }

  // 2. Attach Defensive Security Headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
