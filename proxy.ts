// proxy.ts (ROOT FILE)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyEdgeToken } from "@/lib/auth-edge";

export const config = {
  matcher: ["/admin/:path*", "/profile", "/api/admin/:path*"],
};

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // not logged in
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const decoded = await verifyEdgeToken(token);
  if (!decoded) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // admin guard
  const isAdminArea =
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/api/admin");

  if (isAdminArea) {
    const allowed = ["admin", "editor", "content_manager"];
    if (!allowed.includes(decoded.role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}





// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { verifyToken } from "@/lib/auth";

// export const config = {
//   matcher: ["/admin/:path*"],
// };

// export function proxy(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   const decoded = verifyToken(token);

//   if (!decoded) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   const allowedRoles = ["admin", "editor", "content_manager"];

//   if (!allowedRoles.includes(decoded.role)) {
    
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }

//   return NextResponse.next();
// }



