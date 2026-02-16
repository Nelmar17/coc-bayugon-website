import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* ---------------- GET ---------------- */
export async function GET(req: NextRequest) {
  const items = await prisma.directory.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

/* ---------------- POST ---------------- */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const data = await req.json();

  // ✅ REMOVE NON-DB FIELD
  const { removedGalleryIds, ...safeData } = data;

  const newItem = await prisma.directory.create({
    data: safeData,
  });

  return NextResponse.json(newItem, { status: 201 });
}
