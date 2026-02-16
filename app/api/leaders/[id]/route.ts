import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";
import cloudinary from "@/lib/cloudinary";

/* =========================
   PUT (UPDATE)
   ========================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(["admin"]);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const leaderId = Number(id);

    if (!leaderId || Number.isNaN(leaderId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const data = await req.json();
    const newImageId: string | null = data.imageId || null;

    const existing = await prisma.leader.findUnique({
      where: { id: leaderId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    /* 🔥 ONE RULE TO DELETE OLD IMAGE */
    if (existing.imageId && existing.imageId !== newImageId) {
      try {
        await cloudinary.uploader.destroy(existing.imageId, {
          resource_type: "image",
        });
      } catch (err) {
        console.error("Cloudinary delete failed:", err);
      }
    }

    const updated = await prisma.leader.update({
      where: { id: leaderId },
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        imageId: newImageId,
        order: data.order ?? 0,
        active: data.active ?? existing.active,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/leaders/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* =========================
   DELETE
   ========================= */
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(["admin"]);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const leaderId = Number(id);

    if (!leaderId || Number.isNaN(leaderId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.leader.findUnique({
      where: { id: leaderId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    /* 🔥 DELETE IMAGE FIRST */
    if (existing.imageId) {
      try {
        await cloudinary.uploader.destroy(existing.imageId, {
          resource_type: "image",
        });
      } catch (err) {
        console.error("Cloudinary delete failed:", err);
      }
    }

    await prisma.leader.delete({
      where: { id: leaderId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/leaders/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
