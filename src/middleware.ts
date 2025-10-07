import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/api/auth", "/api/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("better-auth.session_token");

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // note: we only check cookie presence here, not validity.
  // full validation happens in api routes via authClient.getSession()

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
