import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function requireAuth() {
  const token = (await cookies()).get("token")?.value ?? null;
  return await getUserFromToken(token);
}

export async function requireStaff() {
  const user = await requireAuth();
  if (!user) return null;

  if (
    user.role === "admin" ||
    user.role === "editor" ||
    user.role === "content_manager" ||
    user.role === "viewer"
  ) {
    return user;
  }

  return null;
}

export async function requireAdmin() {
  const user = await requireAuth();
  return user?.role === "admin" ? user : null;
}
