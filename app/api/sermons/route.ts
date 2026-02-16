// app/api/sermons/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

/* ======================================================
   GET (PUBLIC)
   - Supports filtering via query params:
     ?category=Faith
     ?preacher=John Doe
     ?category=Faith&preacher=John Doe
   ====================================================== */
    export async function GET(req: NextRequest) {
      try {
        const { searchParams } = new URL(req.url);
        const preacher = searchParams.get("preacher");
        const category = searchParams.get("category");

        const filters: any = {};
        if (preacher) filters.preacher = preacher;
        if (category) filters.category = category;

        // 1️⃣ PINNED
        const pinned = await prisma.sermon.findMany({
          where: { isPinned: true },
          orderBy: { date: "desc" },
        });

        // 2️⃣ NORMAL
        const normal = await prisma.sermon.findMany({
          where: { ...filters, isPinned: false },
          orderBy: { date: "desc" },
        });

        return NextResponse.json([...pinned, ...normal]);
      } catch (err) {
        console.error("SERMON GET ERROR:", err);
        return NextResponse.json(
          { message: "Failed to load sermons" },
          { status: 500 }
        );
      }
    }


/* ======================================================
   POST (ADMIN + EDITOR)
   ====================================================== */
export async function POST(req: NextRequest) {
  const user = await requireAdmin(["admin", "editor"]);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const created = await prisma.sermon.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("SERMON POST ERROR:", err);
    return NextResponse.json(
      { message: "Failed to create sermon" },
      { status: 500 }
    );
  }
}












// // app/api/sermons/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { requireAdmin } from "@/lib/requireAuth";

// /* ---------------- GET (PUBLIC) ---------------- */
// export async function GET() {
//   const sermons = await prisma.sermon.findMany({
//     orderBy: { date: "desc" },
//   });

//   return NextResponse.json(sermons);
// }

// /* ---------------- POST (ADMIN + EDITOR) ---------------- */
// export async function POST(req: NextRequest) {
//   const user = await requireAdmin(["admin", "editor"]);
//   if (!user) {
//     return NextResponse.json(
//       { message: "Unauthorized" },
//       { status: 401 }
//     );
//   }

//   const body = await req.json();

//   if (!body.title || !body.date) {
//     return NextResponse.json(
//       { message: "Title and date are required" },
//       { status: 400 }
//     );
//   }

//   const sermon = await prisma.sermon.create({
//     data: {
//       ...body,
//       date: new Date(body.date),
//     },
//   });

//   return NextResponse.json(sermon, { status: 201 });
// }
