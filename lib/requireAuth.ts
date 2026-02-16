// lib/requireAuth.ts

import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* ------------------ BASE AUTH ------------------ */
export async function requireAuth() {
  const cookieStore = await cookies(); // ✅ AWAIT REQUIRED
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const user = await getUserFromToken(token);
  return user ?? null;
}

/* ------------------ ADMIN AUTH ------------------ */
export async function requireAdmin(
  allowedRoles: Array<"admin" | "editor" | "content_manager"> = ["admin"]
) {
  const user = await requireAuth();
  if (!user) return null;

  if (!allowedRoles.includes(user.role as any)) return null;

  return user;
}



// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// export async function requireAuth() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value ?? null;
//   if (!token) return null;
//   return getUserFromToken(token);
// }

// export async function requireAdmin() {
//   const user = await requireAuth();
//   if (!user) return null;
//   const allowed = ["admin", "editor", "content_manager"];
//   if (!allowed.includes(user.role)) return null;
//   return user;
// }
