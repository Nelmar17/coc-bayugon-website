import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function requireRole(roles: string[]) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const user = await getUserFromToken(token);
  if (!user) return null;

  return roles.includes(user.role) ? user : null;
}
