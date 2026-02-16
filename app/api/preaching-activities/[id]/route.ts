import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";
import cloudinary from "@/lib/cloudinary";

/* ---------------- GET ONE (PUBLIC) ---------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const activityId = Number(id);

  if (Number.isNaN(activityId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const item = await prisma.preachingActivity.findUnique({
    where: { id: activityId },
  });

  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

/* ---------------- PUT (ADMIN + EDITOR) ---------------- */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(["admin", "editor"]);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const activityId = Number(id);
  if (Number.isNaN(activityId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const data = await req.json();

  const existing = await prisma.preachingActivity.findUnique({
    where: { id: activityId },
  });

  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // ✅ Normalize arrays
  const nextGalleryIds: string[] = Array.isArray(data.galleryIds) ? data.galleryIds : [];
  const nextGallery: string[] = Array.isArray(data.gallery) ? data.gallery : [];

  // 🔥 Delete removed gallery images
  for (const oldId of existing.galleryIds) {
    if (oldId && !nextGalleryIds.includes(oldId)) {
      await cloudinary.uploader.destroy(oldId);
    }
  }

  // 🔥 Delete old cover if replaced
  if (existing.coverImageId && existing.coverImageId !== data.coverImageId) {
    await cloudinary.uploader.destroy(existing.coverImageId);
  }

  const updated = await prisma.preachingActivity.update({
    where: { id: activityId },
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

      gallery: nextGallery,
      galleryIds: nextGalleryIds,
    },
  });

  return NextResponse.json(updated);
}

/* ---------------- DELETE (ADMIN ONLY) ---------------- */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(["admin"]);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const activityId = Number(id);
  if (Number.isNaN(activityId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const item = await prisma.preachingActivity.findUnique({
    where: { id: activityId },
  });

  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (item.coverImageId) await cloudinary.uploader.destroy(item.coverImageId);

  for (const pid of item.galleryIds ?? []) {
    if (pid) await cloudinary.uploader.destroy(pid);
  }

  await prisma.preachingActivity.delete({ where: { id: activityId } });
  return NextResponse.json({ success: true });
}
