import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

/* ---------------- GET (PUBLIC) ---------------- */
export async function GET() {
  const items = await prisma.preachingActivity.findMany({
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(items);
}

/* ---------------- POST (ADMIN + EDITOR) ---------------- */
export async function POST(req: NextRequest) {
  const user = await requireAdmin(["admin", "editor"]);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  if (!data.title || !data.type || !data.preacher || !data.location || !data.startDate) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  const created = await prisma.preachingActivity.create({
    data: {
      title: data.title,
      type: data.type,

      preacher: data.preacher,
      description: data.description || null,
      outline: data.outline || null,
      content: data.content || null,

      congregation: data.congregation || null,
      location: data.location,
      address: data.address || null,

      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,

      scheduleId: data.scheduleId ?? null,
      eventId: data.eventId ?? null,

      coverImageUrl: data.coverImageUrl || null,
      coverImageId: data.coverImageId || null,

      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      galleryIds: Array.isArray(data.galleryIds) ? data.galleryIds : [],
    },
  });

  return NextResponse.json(created, { status: 201 });
}
