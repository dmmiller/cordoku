import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CORD_USER_COOKIE, NEXT_URL_COOKIE } from "./constants";

// middleware that :
// check if user is login
// if not, rewrite the request so it goes to /signin,
// this magically puts/preserve the referer header
export function middleware(request: NextRequest) {
  const user = request.cookies.get(CORD_USER_COOKIE);
  if (!user) {
    const response = NextResponse.redirect(new URL("/signin", request.url));
    response.cookies.set(NEXT_URL_COOKIE, request.url);
    return response;
  }
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - signin (login page)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|signin|favicon.ico).*)',
  ],
}
