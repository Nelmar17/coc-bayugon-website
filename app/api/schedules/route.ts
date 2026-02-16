import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* GET (PUBLIC) */
export async function GET() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json(schedules);
}

/* POST (ADMIN + EDITOR) */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user || !["admin", "editor"].includes(user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const created = await prisma.schedule.create({
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

  return NextResponse.json(created, { status: 201 });
}





//OLD CODE

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// export async function GET() {
//   const schedules = await prisma.schedule.findMany({
//     orderBy: { eventDate: "asc" },
//   });
//   return NextResponse.json(schedules);
// }

// export async function POST(req: NextRequest) {
//   const token = (await cookies()).get("token")?.value;
//   const user = await getUserFromToken(token);
//   if (!user) return NextResponse.json("Unauthorized", { status: 401 });

//   const { title, day, time, serviceName, preacher, location, eventDate } =
//     await req.json();

//   const created = await prisma.schedule.create({
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

//   return NextResponse.json(created, { status: 201 });
// }
