export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { normalizeDate } from "@/lib/date";
import { AttendanceType } from "@prisma/client";

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const serviceTypeRaw = searchParams.get("type");

  if (!dateStr || !serviceTypeRaw)
    return NextResponse.json({ message: "Invalid params" }, { status: 400 });

  const date = normalizeDate(dateStr);
  if (!date)
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });

  if (
    !Object.values(AttendanceType).includes(
      serviceTypeRaw as AttendanceType
    )
  ) {
    return NextResponse.json(
      { message: "Invalid attendance type" },
      { status: 400 }
    );
  }

  const serviceType = serviceTypeRaw as AttendanceType;

  const result = await prisma.attendance.deleteMany({
    where: {
      date,
      type: serviceType,
    },
  });

  return NextResponse.json({
    success: true,
    deleted: result.count,
  });
}
