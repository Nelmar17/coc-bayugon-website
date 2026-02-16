export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { format } from "date-fns";
import { AttendanceType } from "@prisma/client";

/* ---------------------------------------------
 * Helpers
 * -------------------------------------------- */

async function requireLogin() {
  const token = (await cookies()).get("token")?.value ?? null;
  if (!token) return null;
  return getUserFromToken(token);
}

function startOfYear(year: number) {
  return new Date(year, 0, 1, 0, 0, 0);
}

function endOfYear(year: number) {
  return new Date(year, 11, 31, 23, 59, 59);
}

/**
 * IMPORTANT:
 * - null = ALL TYPES
 * - no default worship
 */
function parseType(raw: string | null): AttendanceType | null {
  if (!raw || raw === "all") return null;
  if (raw === "worship") return AttendanceType.worship;
  if (raw === "bible_study") return AttendanceType.bible_study;
  if (raw === "event") return AttendanceType.event;
  return null;
}

/* ---------------------------------------------
 * GET: My Attendance (PUBLIC)
 * -------------------------------------------- */

export async function GET(req: Request) {
  const user = await requireLogin();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const range = searchParams.get("range") || "year"; // 30 | 90 | year | all
  const type = parseType(searchParams.get("type"));

  try {
    /* -----------------------------------------
     * Resolve member (STRONG + FALLBACK)
     * ----------------------------------------- */
    let member = await prisma.member.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!member && user.email) {
      member = await prisma.member.findFirst({
        where: {
          email: user.email,
          userId: null, // 🚫 never steal linked member
        },
        select: { id: true },
      });
    }

    if (!member) {
      return NextResponse.json({
        summary: { total: 0, present: 0, absent: 0, rate: 0 },
        streaks: { current: 0, best: 0 },
        grouped: {},
      });
    }

    /* -----------------------------------------
     * Date range
     * ----------------------------------------- */
    let from: Date | undefined;
    let to: Date | undefined;

    if (range === "30") {
      to = new Date();
      from = new Date();
      from.setDate(from.getDate() - 30);
    } else if (range === "90") {
      to = new Date();
      from = new Date();
      from.setDate(from.getDate() - 90);
    } else if (range === "year") {
      from = startOfYear(year);
      to = endOfYear(year);
    }
    // range === "all" → no date filter

    /* -----------------------------------------
     * Fetch attendance (THIS WAS THE BUG 🔥)
     * ----------------------------------------- */
    const records = await prisma.attendance.findMany({
      where: {
        memberId: member.id,
        ...(type ? { type } : {}), // ✅ ALL TYPES when null
        ...(from && to
          ? {
              date: {
                gte: from,
                lte: to,
              },
            }
          : {}),
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        status: true,
        type: true,
      },
    });

    /* -----------------------------------------
     * Summary
     * ----------------------------------------- */
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = total - present;
    const rate = total ? Math.round((present / total) * 100) : 0;

    /* -----------------------------------------
     * Group by month (yyyy-MM)
     * ----------------------------------------- */
    const grouped: Record<
      string,
      { date: string; status: string; type: string }[]
    > = {};

    for (const r of records) {
      const key = format(r.date, "yyyy-MM");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        date: format(r.date, "yyyy-MM-dd"),
        status: r.status,
        type: r.type,
      });
    }

    /* -----------------------------------------
     * Streaks
     * ----------------------------------------- */
    let current = 0;
    let best = 0;
    let run = 0;

    const desc = [...records].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // current streak
    for (const r of desc) {
      if (r.status === "present") current++;
      else break;
    }

    // best streak
    for (const r of records) {
      if (r.status === "present") {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }

    return NextResponse.json({
      summary: { total, present, absent, rate },
      streaks: { current, best },
      grouped,
    });
  } catch (err) {
    console.error("❌ /api/public/me/attendance failed:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
