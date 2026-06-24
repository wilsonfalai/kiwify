import { createRouteProtection, getSessionFromHeaders } from "@kiwifyclone/auth";

export function middleware(request: { headers: Headers }) {
  return createRouteProtection(getSessionFromHeaders(request.headers), "/login");
}

export const config = {
  matcher: ["/((?!login|_next|favicon.ico).*)"]
};
