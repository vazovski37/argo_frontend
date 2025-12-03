import { NextResponse, type NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/api/auth/login", "/api/auth/register", "/api/auth/google"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes for auth checking (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for auth token in httpOnly cookie
  const authToken = request.cookies.get("auth_token")?.value;

  // If no token and trying to access protected route, redirect to login
  if (!authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
