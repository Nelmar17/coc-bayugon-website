import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

export async function GET() {
  const admin = await requireAdmin(["admin"]);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      deletedAt: true,
    },
  });

  return NextResponse.json(users);
}
