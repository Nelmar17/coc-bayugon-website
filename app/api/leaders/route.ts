import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

/* =========================
   GET (PUBLIC)
   ========================= */
export async function GET() {
  const leaders = await prisma.leader.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(leaders);
}

/* =========================
   POST (ADMIN)
   ========================= */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["admin"]);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const created = await prisma.leader.create({
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        imageId: data.imageId || null,
        order: data.order ?? 0,
        active: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/leaders error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
