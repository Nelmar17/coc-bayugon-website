export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { normalizeDate } from "@/lib/date";

async function requireLogin() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) return null;
  return user;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireLogin();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const memberId = Number(id);

  if (!id || Number.isNaN(memberId)) {
    return NextResponse.json({ message: "Invalid member ID" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);

  const fromStr = searchParams.get("from") ?? "";
  const toStr = searchParams.get("to") ?? "";
  const type = searchParams.get("type") ?? "";

  // ✅ ADD THIS
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const skip = (page - 1) * limit;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      congregation: true,
    },
  });

  if (!member) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }

  const where: any = { memberId };

  const from = fromStr ? normalizeDate(fromStr) : null;
  const to = toStr ? normalizeDate(toStr) : null;

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  if (type) where.type = type;

  // ✅ IMPORTANT: count first (for total pages)
  const total = await prisma.attendance.count({ where });

  const records = await prisma.attendance.findMany({
    where,
    orderBy: [{ date: "desc" }],
    skip,
    take: limit,
    select: {
      id: true,
      date: true,
      type: true,
      status: true,
      notes: true,
    },
  });

  // ✅ summary should be based on ALL records (not paginated)
  const allRecords = await prisma.attendance.findMany({
    where,
    select: { status: true },
  });

  const present = allRecords.filter((r) => r.status === "present").length;
  const absent = allRecords.filter((r) => r.status === "absent").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return NextResponse.json({
    member,
    summary: {
      total,
      present,
      absent,
      rate,
    },
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}