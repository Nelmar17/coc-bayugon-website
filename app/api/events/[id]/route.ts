// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { deleteCloudinary } from "@/lib/deleteCloudinary";
import { eventUpdateSchema } from "@/lib/validators/event";

/* AUTH */
async function requireEditorOrAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user && ["admin", "editor"].includes(user.role) ? user : null;
}

async function requireAdminOnly() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user?.role === "admin" ? user : null;
}

/* GET (PUBLIC) */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const eventId = Number(id);


  if (isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },

     include: {
      preachingActivities: {
        orderBy: { startDate: "desc" },

      },
    },
  });

  if (!event) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (!event.isPublished) {
    const user = await requireEditorOrAdmin();
    if (!user) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json(event);
}


/* PUT (ADMIN + EDITOR) */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireEditorOrAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = eventUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const v = parsed.data;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(v.title !== undefined ? { title: v.title } : {}),
      ...(v.description !== undefined ? { description: v.description ?? null } : {}),
      ...(v.location !== undefined ? { location: v.location ?? null } : {}),

      ...(v.latitude !== undefined ? { latitude: v.latitude ?? null } : {}),
      ...(v.longitude !== undefined ? { longitude: v.longitude ?? null } : {}),

      ...(v.imageUrl !== undefined ? { imageUrl: v.imageUrl ?? null } : {}),
      ...(v.imageId !== undefined ? { imageId: v.imageId ?? null } : {}),

      ...(v.isPublished !== undefined ? { isPublished: v.isPublished } : {}),
      ...(v.isFeatured !== undefined ? { isFeatured: v.isFeatured } : {}),

      ...(v.eventDate !== undefined ? { eventDate: new Date(v.eventDate) } : {}),
      ...(v.endDate !== undefined
        ? { endDate: v.endDate ? new Date(v.endDate) : null }
        : {}),
    },
  });

  return NextResponse.json(updated);
}


/* DELETE (ADMIN ONLY) */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminOnly())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (event.imageId) {
    try {
      await deleteCloudinary(event.imageId, "image");
    } catch (err) {
      console.warn("Cloudinary delete failed:", err);
    }
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return NextResponse.json({ success: true });
}

