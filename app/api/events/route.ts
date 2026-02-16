// app/api/events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { eventCreateSchema } from "@/lib/validators/event";

async function requireEditorOrAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user && ["admin", "editor"].includes(user.role) ? user : null;
}

/* GET */
export async function GET(req: Request) {
  const url = new URL(req.url);

  const all = url.searchParams.get("all") === "1";
  const type = url.searchParams.get("type"); 
  // type can be: upcoming | past | all

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔒 ADMIN FULL ACCESS
  if (all) {
    if (!(await requireEditorOrAdmin())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json(events);
  }

  // 🌍 PUBLIC FILTERING
  let where: any = {
    isPublished: true,
  };

  if (type === "past") {
    where.eventDate = { lt: today };
  } else if (type === "all") {
    // no date filter
  } else {
    // default = upcoming only
    where.eventDate = { gte: today };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json(events);
}


/* POST (ADMIN + EDITOR) */
export async function POST(req: Request) {
  if (!(await requireEditorOrAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = eventCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const v = parsed.data;

  const created = await prisma.event.create({
    data: {
      title: v.title,
      description: v.description ?? null,
      location: v.location ?? null,

      latitude: v.latitude ?? null,
      longitude: v.longitude ?? null,

      imageUrl: v.imageUrl ?? null,
      imageId: v.imageId ?? null,

      isPublished: v.isPublished ?? true,
      isFeatured: v.isFeatured ?? false,

      eventDate: new Date(v.eventDate),
      endDate: v.endDate ? new Date(v.endDate) : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}