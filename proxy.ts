import { NextResponse, type NextRequest } from "next/server";

type Role = "admin" | "authority" | "citizen";

type UserData = {
  role?: string;
};

function safeParseUserData(raw: string | undefined): UserData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserData;
  } catch {
    return null;
  }
}

function normalizeRole(role: unknown): Role | null {
  if (role === "admin" || role === "authority" || role === "citizen") return role;
  return null;
}

function roleHome(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "authority") return "/authority";
  return "/citizen";
}

function loginPageForPath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin/login";
  if (pathname.startsWith("/authority")) return "/authority/login";
  return "/login";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages
  const isPublicAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/admin/login" ||
    pathname === "/authority/login";

  const userCookie = req.cookies.get("user_data")?.value;
  const userData = safeParseUserData(userCookie);
  const userRole = normalizeRole(userData?.role);

  // If logged in, don’t allow visiting other login pages by URL
  if (isPublicAuthPage && userRole) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(userRole);
    return NextResponse.redirect(url);
  }

  // Protected areas: block cross-role URL navigation
  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAuthorityArea =
    pathname.startsWith("/authority") && pathname !== "/authority/login";
  const isCitizenArea = pathname.startsWith("/citizen");

  if (isAdminArea) {
    if (!userRole) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (userRole !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = roleHome(userRole);
      return NextResponse.redirect(url);
    }
  }

  if (isAuthorityArea) {
    if (!userRole) {
      const url = req.nextUrl.clone();
      url.pathname = "/authority/login";
      return NextResponse.redirect(url);
    }
    if (userRole !== "authority") {
      const url = req.nextUrl.clone();
      url.pathname = roleHome(userRole);
      return NextResponse.redirect(url);
    }
  }

  if (isCitizenArea) {
    if (!userRole) {
      const url = req.nextUrl.clone();
      url.pathname = loginPageForPath(pathname);
      return NextResponse.redirect(url);
    }
    if (userRole !== "citizen") {
      const url = req.nextUrl.clone();
      url.pathname = roleHome(userRole);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)",
  ],
};
