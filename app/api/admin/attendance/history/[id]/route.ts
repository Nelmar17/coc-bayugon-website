export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

async function requireStaff() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) return null;

  if (["admin", "editor", "content_manager"].includes(user.role)) {
    return user;
  }
  return null;
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ✅ REQUIRED IN NEXT 16
  const { id } = await context.params;
  const attendanceId = Number(id);

  if (!id || Number.isNaN(attendanceId)) {
    return NextResponse.json(
      { message: "Invalid ID", id },
      { status: 400 }
    );
  }

  await prisma.attendance.delete({
    where: { id: attendanceId },
  });

  return NextResponse.json({ success: true });
}
