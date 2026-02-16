export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      member: null, // 👈 NOT LINKED YET
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { email: "asc" },
  });

  return NextResponse.json(users);
}
