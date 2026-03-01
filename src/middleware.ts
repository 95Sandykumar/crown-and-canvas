import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Only check state-changing methods (POST, PUT, DELETE, PATCH)
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return NextResponse.next();
  }

  // Skip CSRF check for Stripe webhooks (they use signature verification)
  if (req.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
  }

  // Verify origin header to prevent CSRF
  const origin = req.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const allowedOrigin = new URL(appUrl).origin;
    if (origin && origin !== allowedOrigin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    // If URL parsing fails, allow the request (dev environment)
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
