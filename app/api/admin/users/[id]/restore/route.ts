import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(["admin"]);
  if (!admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 401 });
  }

  const { id } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true, deletedAt: true },
  });

  if (!user || !user.deletedAt) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    }),
    prisma.auditLog.create({
      data: {
        action: "RESTORE",
        targetId: id,
        targetEmail: user.email,
        actorId: admin.id,
        actorRole: admin.role,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
