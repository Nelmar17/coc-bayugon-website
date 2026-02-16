// lib/requireAdmin.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function requireAdmin() {
  const cookieStore = await cookies(); // ✅ MUST await
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const allowedRoles = ["admin", "editor", "content_manager"];

  if (!allowedRoles.includes(decoded.role)) {
    return null;
  }

  return decoded;
}
