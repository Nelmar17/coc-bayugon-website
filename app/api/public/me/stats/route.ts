export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* ---------------------------------------------
 * Helpers
 * -------------------------------------------- */

async function requireLogin() {
  const token = (await cookies()).get("token")?.value ?? null;
  if (!token) return null;
  return getUserFromToken(token);
}

/* ---------------------------------------------
 * GET: My Attendance Stats
 * -------------------------------------------- */

export async function GET() {
  const user = await requireLogin();
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 1️⃣ STRONG LINK FIRST (userId)
    let member = await prisma.member.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    // 2️⃣ FALLBACK: legacy email match
    if (!member && user.email) {
      member = await prisma.member.findFirst({
        where: {
          email: user.email,
          userId: null, // 🚫 do NOT steal linked member
        },
        select: { id: true },
      });
    }

    // ✅ Not a member → safe empty stats
    if (!member) {
      return NextResponse.json({
        total: 0,
        present: 0,
        absent: 0,
        rate: 0,
      });
    }

    const total = await prisma.attendance.count({
      where: { memberId: member.id },
    });

    const present = await prisma.attendance.count({
      where: {
        memberId: member.id,
        status: "present", // or present: true (depends on schema)
      },
    });

    const absent = total - present;
    const rate = total > 0
      ? Math.round((present / total) * 100)
      : 0;

    return NextResponse.json({
      total,
      present,
      absent,
      rate,
    });
  } catch (err) {
    console.error("❌ MEMBER STATS FAILED:", err);
    return NextResponse.json({
      total: 0,
      present: 0,
      absent: 0,
      rate: 0,
    });
  }
}
