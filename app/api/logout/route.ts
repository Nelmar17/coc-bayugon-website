// app/api/logout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function POST() {
  // ✅ cookies() IS ASYNC
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // 🔴 mark offline
  if (token) {
    const user = await getUserFromToken(token);

    if (user?.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { onlineAt: null },
      });
    }
  }

  // 🔐 clear cookie
  const res = NextResponse.json({ success: true });

  res.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}
