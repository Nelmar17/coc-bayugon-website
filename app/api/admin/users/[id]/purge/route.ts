import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const admin = await requireAdmin(["admin"]);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ✅ ALWAYS AWAIT PARAMS (APP ROUTER SAFE)
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "Invalid user id" },
      { status: 400 }
    );
  }

  try {
    /* ---------------- CHECK USER ---------------- */
    const user = await prisma.user.findUnique({
      where: { id },
      select: { deletedAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.deletedAt) {
      return NextResponse.json(
        { message: "User must be soft-deleted first" },
        { status: 400 }
      );
    }

    /* ---------------- HARD DELETE (SAFE ORDER) ---------------- */
    await prisma.auditLog.deleteMany({
      where: { targetId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PURGE USER ERROR:", err);

    return NextResponse.json(
      { message: "Failed to purge user" },
      { status: 500 }
    );
  }
}
