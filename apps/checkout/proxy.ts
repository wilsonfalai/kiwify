import { createRouteProtection, getSessionFromHeaders } from "@kiwifyclone/auth";
import { type NextRequest, NextResponse } from "next/server";

export function checkoutRouteProtection(request: { headers: Headers }) {
  return createRouteProtection(getSessionFromHeaders(request.headers), "/login");
}

export function proxy(request: NextRequest) {
  const protection = checkoutRouteProtection(request);

  if (protection.allowed) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(protection.redirectTo ?? "/login", request.url));
}

export const config = {
  matcher: ["/account/:path*"]
};
