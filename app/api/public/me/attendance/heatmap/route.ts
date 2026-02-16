export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { AttendanceType } from "@prisma/client";

async function requireLogin() {
  const token = (await cookies()).get("token")?.value ?? null;
  if (!token) return null;
  return getUserFromToken(token);
}

function parseType(raw: string | null): AttendanceType | null {
  if (!raw || raw === "all") return null;
  if (raw === "worship") return AttendanceType.worship;
  if (raw === "bible_study") return AttendanceType.bible_study;
  if (raw === "event") return AttendanceType.event;
  return null;
}

function startOfYear(year: number) {
  return new Date(year, 0, 1, 0, 0, 0);
}

function endOfYear(year: number) {
  return new Date(year, 11, 31, 23, 59, 59);
}

export async function GET(req: Request) {
  const user = await requireLogin();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const type = parseType(searchParams.get("type"));

  try {
    // Resolve member: strong link, then legacy fallback
    let member = await prisma.member.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!member && user.email) {
      member = await prisma.member.findFirst({
        where: { email: user.email },
        select: { id: true },
      });
    }

    if (!member) {
      return NextResponse.json({
        year,
        days: {},
      });
    }

    const from = startOfYear(year);
    const to = endOfYear(year);

    const records = await prisma.attendance.findMany({
      where: {
        memberId: member.id,
        ...(type ? { type } : {}),
        date: { gte: from, lte: to },
      },
      select: {
        date: true,
        status: true,
        type: true,
      },
      orderBy: { date: "asc" },
    });

    // dayKey => { total, present }
    const days: Record<string, { total: number; present: number }> = {};

    for (const r of records) {
      // normalize to yyyy-mm-dd (server side)
      const d = new Date(r.date);
      const key = d.toISOString().slice(0, 10);

      if (!days[key]) days[key] = { total: 0, present: 0 };
      days[key].total += 1;
      if (r.status === "present") days[key].present += 1;
    }

    return NextResponse.json({ year, days });
  } catch (err) {
    console.error("❌ heatmap failed:", err);
    return NextResponse.json({ year, days: {} }, { status: 200 });
  }
}
