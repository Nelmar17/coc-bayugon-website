import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

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

/* GET */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;


  const schedule = await prisma.schedule.findUnique({
  where: { id: Number(id) },
  include: {
    preachingActivities: {
      orderBy: { startDate: "desc" },
    },
  },
});

  // const schedule = await prisma.schedule.findUnique({
  //   where: { id: Number(id) },
  // });

  if (!schedule)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json(schedule);
}

/* PUT (ADMIN + EDITOR) */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireEditorOrAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  const updated = await prisma.schedule.update({
    where: { id: Number(id) },
    data: {
      ...body,

      latitude:
        body.latitude === null || body.latitude === undefined
          ? null
          : Number(body.latitude),

      longitude:
        body.longitude === null || body.longitude === undefined
          ? null
          : Number(body.longitude),

      recurrence: body.recurrence ?? null,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });

  return NextResponse.json(updated);
}


/* DELETE (ADMIN ONLY) */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminOnly()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  await prisma.schedule.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}





//OLD CODE

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// async function requireAdmin() {
//   const token = (await cookies()).get("token")?.value;
//   const user = await getUserFromToken(token);
//   return user?.role === "admin" ? user : null;
// }

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;

//   const schedule = await prisma.schedule.findUnique({
//     where: { id: Number(id) },
//   });

//   return NextResponse.json(schedule);
// }

// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   if (!(await requireAdmin()))
//     return NextResponse.json("Unauthorized", { status: 401 });

//   const { id } = await context.params;

//   const { title, day, time, serviceName, preacher, location, eventDate } =
//     await req.json();

//   const updated = await prisma.schedule.update({
//     where: { id: Number(id) },
//     data: {
//       title,
//       day,
//       time,
//       serviceName,
//       preacher,
//       location,
//       eventDate: eventDate ? new Date(eventDate) : null,
//     },
//   });

//   return NextResponse.json(updated);
// }

// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   if (!(await requireAdmin()))
//     return NextResponse.json("Unauthorized", { status: 401 });

//   const { id } = await context.params;

//   await prisma.schedule.delete({
//     where: { id: Number(id) },
//   });

//   return NextResponse.json({ success: true });
// }
