import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // مسیرهای عمومی
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // بررسی token در cookie یا localStorage (در server فقط cookie)
  // چون localStorage در server نیست، redirect به login می‌کنیم و کلاینت چک می‌کند
  // اینجا ساده نگه می‌داریم - فقط مسیر dashboard را چک می‌کنیم
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
