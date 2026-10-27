import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Edge middleware: injects security headers and ensures the CSRF
 * cookie exists. Runs before every matched route.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/app") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/ai");

  if (isProtected && !request.cookies.get("zsession")) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  const response = NextResponse.next();


  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  const csp =
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'";
  response.headers.set("Content-Security-Policy", csp);

  // Ensure a CSRF cookie is present for double-submit protection.
  if (!request.cookies.get("zcsrftoken")) {
    response.cookies.set({
      name: "zcsrftoken",
      value: Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      secure: process.env.APP_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and files.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|robots.txt).*)",
  ],
};
