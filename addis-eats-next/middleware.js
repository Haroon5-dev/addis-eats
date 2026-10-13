import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "./lib/session-token.js";

export async function middleware(request) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const pathname = request.nextUrl.pathname;

  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/staff/kitchen") && !["staff", "kitchen"].includes(session.role)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/checkout/:path*", "/orders/:path*", "/staff/kitchen/:path*"] };
