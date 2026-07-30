import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const offerId = request.nextUrl.searchParams.get("offerId")?.trim();

  if (!offerId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(
    new URL(`/${encodeURIComponent(offerId)}`, request.url)
  );
}
