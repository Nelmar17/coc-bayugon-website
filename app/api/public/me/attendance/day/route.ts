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

function normalizeDay(dateStr: string) {
  // expects YYYY-MM-DD
  const d = new Date(dateStr + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function nextDay(d: Date) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + 1);
  return x;
}

export async function GET(req: Request) {
  const user = await requireLogin();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") || "";
  const type = parseType(searchParams.get("type"));

  const day = normalizeDay(dateStr);
  if (!day) return NextResponse.json({ message: "Invalid date" }, { status: 400 });

  try {
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

    if (!member) return NextResponse.json({ date: dateStr, items: [] });

    const items = await prisma.attendance.findMany({
      where: {
        memberId: member.id,
        ...(type ? { type } : {}),
        date: { gte: day, lt: nextDay(day) },
      },
      select: {
        date: true,
        type: true,
        status: true,
        notes: true,
      },
      orderBy: [{ type: "asc" }],
    });

    return NextResponse.json({
      date: dateStr,
      items: items.map((it) => ({
        type: it.type,
        status: it.status,
        notes: it.notes,
      })),
    });
  } catch (err) {
    console.error("❌ day details failed:", err);
    return NextResponse.json({ date: dateStr, items: [] }, { status: 200 });
  }
}
