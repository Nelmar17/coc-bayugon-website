import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const records = await prisma.attendance.findMany({
    where: { status: "present" },
    select: { date: true },
  });

  // group by month
  const stats: Record<string, number> = {};

  records.forEach((r) => {
    const key = r.date.toISOString().slice(0, 7); // YYYY-MM
    stats[key] = (stats[key] || 0) + 1;
  });

  return NextResponse.json(
    Object.entries(stats).map(([month, total]) => ({
      month,
      total,
    }))
  );
}
