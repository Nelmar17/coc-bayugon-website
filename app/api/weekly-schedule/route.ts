import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ✅ PUBLIC — GET ONLY */
export async function GET() {
  try {
    const data = await prisma.weeklySchedule.findMany({
      where: { isVisible: true },
      orderBy: [{ day: "asc" }, { order: "asc" }],
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Weekly schedule error:", err);
    return NextResponse.json(
      { message: "Failed to load weekly schedule" },
      { status: 500 }
    );
  }
}
