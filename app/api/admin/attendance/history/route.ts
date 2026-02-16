// app/api/admin/attendance/history/route.ts
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

  const role = user.role;
  if (role === "admin" || role === "editor" || role === "content_manager" || role === "viewer")
    return user;

  return null;
}

export async function GET(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const fromStr = searchParams.get("from") ?? "";
  const toStr = searchParams.get("to") ?? "";
  const type = searchParams.get("type") ?? ""; // optional
  const memberIdStr = searchParams.get("memberId") ?? ""; // optional

  const where: any = {};

  // date range
  const from = fromStr ? normalizeDate(fromStr) : null;
  const to = toStr ? normalizeDate(toStr) : null;

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  if (type) where.type = type;
  if (memberIdStr) where.memberId = Number(memberIdStr);

  const records = await prisma.attendance.findMany({
    where,
    include: { member: true },
    orderBy: [{ date: "desc" }, { member: { lastName: "asc" } }],
  });

  return NextResponse.json(records);
}






// // app/api/admin/attendance/history/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// /* ---------------- HELPERS ---------------- */
// function toStartOfDay(d: string) {
//   const dt = new Date(d);
//   dt.setHours(0, 0, 0, 0);
//   return dt;
// }
// function toEndOfDay(d: string) {
//   const dt = new Date(d);
//   dt.setHours(23, 59, 59, 999);
//   return dt;
// }

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   const from = searchParams.get("from") || "";
//   const to = searchParams.get("to") || "";
//   const type = searchParams.get("type") || "";
//   const q = (searchParams.get("q") || "").trim();

//   // 🔥 GROUP EXPAND PARAMS
//   const groupDate = searchParams.get("groupDate");
//   const groupType = searchParams.get("groupType");

//   const page = Math.max(1, Number(searchParams.get("page") || "1"));
//   const pageSize = Math.min(
//     50,
//     Math.max(1, Number(searchParams.get("pageSize") || "10"))
//   );

//   const where: any = {};

//   /* ---------------- FILTER LOGIC ---------------- */

//   // 🔴 GROUP MODE (EXPAND)
//   if (groupDate) {
//     where.date = {
//       gte: toStartOfDay(groupDate),
//       lte: toEndOfDay(groupDate),
//     };
//   }

//   if (groupType) {
//     where.type = groupType;
//   }

//   // 🟢 NORMAL FILTER MODE
//   if (!groupDate && (from || to)) {
//     where.date = {};
//     if (from) where.date.gte = toStartOfDay(from);
//     if (to) where.date.lte = toEndOfDay(to);
//   }

//   if (!groupType && type) {
//     where.type = type;
//   }

//   if (q) {
//     where.OR = [
//       { notes: { contains: q, mode: "insensitive" } },
//       { member: { firstName: { contains: q, mode: "insensitive" } } },
//       { member: { lastName: { contains: q, mode: "insensitive" } } },
//       { member: { congregation: { contains: q, mode: "insensitive" } } },
//     ];
//   }

//   const skip = (page - 1) * pageSize;
//   const take = pageSize;

//   /* ---------------- RECORDS ---------------- */
//   const [total, items] = await Promise.all([
//     prisma.attendance.count({ where }),
//     prisma.attendance.findMany({
//       where,
//       orderBy: [{ date: "desc" }, { id: "desc" }],
//       skip,
//       take,
//       include: {
//         member: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             congregation: true,
//           },
//         },
//       },
//     }),
//   ]);

//   /* ---------------- GROUP SUMMARY (IGNORE GROUP FILTER) ---------------- */
//   const groupWhere: any = {};
//   if (from || to) {
//     groupWhere.date = {};
//     if (from) groupWhere.date.gte = toStartOfDay(from);
//     if (to) groupWhere.date.lte = toEndOfDay(to);
//   }
//   if (type) groupWhere.type = type;
//   if (q) groupWhere.OR = where.OR;

//   const grouped = await prisma.attendance.groupBy({
//     by: ["date", "type", "status"],
//     where: groupWhere,
//     _count: { _all: true },
//     orderBy: [{ date: "desc" }],
//   });

//   const map = new Map<
//     string,
//     { date: string; type: string; present: number; absent: number; total: number }
//   >();

//   for (const g of grouped) {
//     const key = `${g.date.toISOString()}__${g.type}`;
//     const prev =
//       map.get(key) ?? {
//         date: g.date.toISOString(),
//         type: g.type,
//         present: 0,
//         absent: 0,
//         total: 0,
//       };

//     const c = g._count._all;
//     if (g.status === "present") prev.present += c;
//     else prev.absent += c;
//     prev.total += c;

//     map.set(key, prev);
//   }

//   const groupSummary = Array.from(map.values()).sort(
//     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//   );

//   return NextResponse.json({
//     page,
//     pageSize,
//     total,
//     totalPages: Math.ceil(total / pageSize),
//     items,
//     groupSummary,
//   });
// }
