// app/api/admin/attendance/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { normalizeDate } from "@/lib/date";

async function requireStaff() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  if (!user) return null;

  if (["admin", "editor", "content_manager", "viewer"].includes(user.role))
    return user;

  return null;
}

/* =========================
   GET (load attendance)
========================= */
export async function GET(req: NextRequest) {
  const user = await requireStaff();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") ?? "";
  const type = (searchParams.get("type") ?? "worship") as any;

  const date = normalizeDate(dateStr);
  if (!date)
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });

  const members = await prisma.member.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const records = await prisma.attendance.findMany({
    where: { date, type },
    select: { memberId: true, status: true, notes: true },
  });

  const map = new Map(records.map((r) => [r.memberId, r]));

  const items = members.map((m) => ({
    member: m,
    status: map.get(m.id)?.status ?? "absent",
    notes: map.get(m.id)?.notes ?? "",
  }));

  return NextResponse.json({ date: dateStr, type, items });
}

/* =========================
   POST (normal save)
========================= */
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (user.role === "viewer")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const date = normalizeDate(body.date);
  const type = body.type;
  const items = Array.isArray(body.items) ? body.items : [];

  if (!date || !type)
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

  await prisma.$transaction(
    items.map((it: any) =>
      prisma.attendance.upsert({
        where: {
          memberId_date_type: {
            memberId: Number(it.memberId),
            date,
            type,
          },
        },
        update: {
          status: it.status === "present" ? "present" : "absent",
          notes: it.notes || null,
        },
        create: {
          memberId: Number(it.memberId),
          date,
          type,
          status: it.status === "present" ? "present" : "absent",
          notes: it.notes || null,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}

/* =========================
   PUT (MOVE / EDIT DATE & SERVICE)
========================= */
export async function PUT(req: NextRequest) {
  const user = await requireStaff();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (user.role === "viewer")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const fromDate = normalizeDate(body.fromDate);
  const toDate = normalizeDate(body.toDate);
  const fromType = body.fromType;
  const toType = body.toType;
  const items = Array.isArray(body.items) ? body.items : [];

  if (!fromDate || !toDate || !fromType || !toType)
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    // 1️⃣ delete old records
    await tx.attendance.deleteMany({
      where: { date: fromDate, type: fromType },
    });

    // 2️⃣ recreate using UI state (SOURCE OF TRUTH)
    for (const it of items) {
      const memberId = Number(it.memberId);
      const status = it.status === "present" ? "present" : "absent";
      const notes = it.notes ? String(it.notes) : null;

      await tx.attendance.upsert({
        where: {
          memberId_date_type: {
            memberId,
            date: toDate,
            type: toType,
          },
        },
        update: { status, notes },
        create: {
          memberId,
          date: toDate,
          type: toType,
          status,
          notes,
        },
      });
    }
  });

  return NextResponse.json({
    success: true,
    moved: items.length,
  });
}





// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";
// import { normalizeDate } from "@/lib/date";

// async function requireStaff() {
//   const token = (await cookies()).get("token")?.value ?? null;
//   const user = await getUserFromToken(token);
//   if (!user) return null;

//   const role = user.role;
//   if (role === "admin" || role === "editor" || role === "content_manager" || role === "viewer")
//     return user;

//   return null;
// }

// export async function GET(req: NextRequest) {
//   const user = await requireStaff();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const { searchParams } = new URL(req.url);
//   const dateStr = searchParams.get("date") ?? "";
//   const type = (searchParams.get("type") ?? "worship") as any;

//   const date = normalizeDate(dateStr);
//   if (!date) return NextResponse.json({ message: "Invalid date" }, { status: 400 });

//   const members = await prisma.member.findMany({
//     orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
//   });

//   const records = await prisma.attendance.findMany({
//     where: { date, type },
//     select: { memberId: true, status: true, notes: true },
//   });

//   const map = new Map(records.map((r) => [r.memberId, r]));

//   const items = members.map((m) => ({
//     member: m, // ✅ include member for UI
//     status: map.get(m.id)?.status ?? "absent",
//     notes: map.get(m.id)?.notes ?? "",
//   }));

//   return NextResponse.json({ date: dateStr, type, items });
// }

// export async function POST(req: NextRequest) {
//   const user = await requireStaff();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   if (user.role === "viewer") {
//     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
//   }

//   const body = await req.json();

//   const dateStr = String(body.date ?? "");
//   const type = body.type; // worship | bible_study | event
//   const items = Array.isArray(body.items) ? body.items : [];

//   const date = normalizeDate(dateStr);
//   if (!date) return NextResponse.json({ message: "Invalid date" }, { status: 400 });
//   if (!type) return NextResponse.json({ message: "Invalid type" }, { status: 400 });

//   await prisma.$transaction(
//     items.map((it: any) => {
//       const memberId = Number(it.memberId);
//       const status = it.status === "present" ? "present" : "absent";
//       const notes = it.notes ? String(it.notes) : null;

//       return prisma.attendance.upsert({
//         where: { memberId_date_type: { memberId, date, type } },
//         update: { status, notes },
//         create: { memberId, date, type, status, notes },
//       });
//     })
//   );

//   return NextResponse.json({ success: true });
// }

// export async function PUT(req: NextRequest) {
//   const user = await requireStaff();
//   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   if (user.role === "viewer")
//     return NextResponse.json({ message: "Forbidden" }, { status: 403 });

//   const body = await req.json();

//   const fromDate = normalizeDate(body.fromDate);
//   const toDate = normalizeDate(body.toDate);
//   const fromType = body.fromType;
//   const toType = body.toType;

//   if (!fromDate || !toDate || !fromType || !toType) {
//     return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
//   }

//   // get all attendance from old date/type
//   const records = await prisma.attendance.findMany({
//     where: { date: fromDate, type: fromType },
//   });

//   if (records.length === 0) {
//     return NextResponse.json({ message: "No attendance to move" });
//   }

//   await prisma.$transaction(
//     records.map((r) =>
//       prisma.attendance.upsert({
//         where: {
//           memberId_date_type: {
//             memberId: r.memberId,
//             date: toDate,
//             type: toType,
//           },
//         },
//         update: {
//           status: r.status,
//           notes: r.notes,
//         },
//         create: {
//           memberId: r.memberId,
//           date: toDate,
//           type: toType,
//           status: r.status,
//           notes: r.notes,
//         },
//       })
//     )
//   );

//   // delete old wrong records
//   await prisma.attendance.deleteMany({
//     where: { date: fromDate, type: fromType },
//   });

//   return NextResponse.json({ success: true, moved: records.length });
// }




// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// function normalizeDate(dateStr: string) {
//   const d = new Date(dateStr);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { date, type, items } = body;

//     if (!date || !type || !Array.isArray(items)) {
//       return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
//     }

//     const normalized = normalizeDate(date);

//     await prisma.$transaction(
//       items.map((it: any) =>
//         prisma.attendance.upsert({
//           where: {
//             memberId_date_type: {
//               memberId: Number(it.memberId),
//               date: normalized,
//               type,
//             },
//           },
//           update: {
//             status: it.status,
//             notes: it.notes ?? "",
//           },
//           create: {
//             memberId: Number(it.memberId),
//             date: normalized,
//             type,
//             status: it.status,
//             notes: it.notes ?? "",
//           },
//         })
//       )
//     );

//     return NextResponse.json({ ok: true });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }
