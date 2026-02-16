import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

export async function GET() {
  const admin = await requireAdmin(["admin"]);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(logs);
}
