// app/api/sermons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAuth";

/* ---------------- GET (PUBLIC) ---------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sermonId = Number(id);

  if (Number.isNaN(sermonId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const sermon = await prisma.sermon.findUnique({
    where: { id: sermonId },
  });

  if (!sermon) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(sermon);
}

/* ---------------- PUT (ADMIN + EDITOR) ---------------- */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(["admin", "editor"]);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const sermonId = Number(id);

  if (Number.isNaN(sermonId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await req.json();

    // ✅ normalize date
    if (data.date) {
      const d = new Date(data.date);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { message: "Invalid date" },
          { status: 400 }
        );
      }
      data.date = d;
    }

    const updated = await prisma.sermon.update({
      where: { id: sermonId },
      data: {
        ...data,
        isPinned: data.isPinned ?? false, // ✅
      },
    });
    // const updated = await prisma.sermon.update({
    //   where: { id: sermonId },
    //   data,
    // });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("SERMON PUT ERROR:", err);
    return NextResponse.json(
      { message: "Failed to update sermon" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE (ADMIN ONLY) ---------------- */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(["admin"]);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const sermonId = Number(id);

  if (Number.isNaN(sermonId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  await prisma.sermon.delete({
    where: { id: sermonId },
  });

  return NextResponse.json({ success: true });
}








// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { requireAdmin } from "@/lib/requireAuth";

// /* ---------------- GET (PUBLIC) ---------------- */
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;
//   const sermonId = Number(id);

//   if (Number.isNaN(sermonId)) {
//     return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
//   }

//   const sermon = await prisma.sermon.findUnique({
//     where: { id: sermonId },
//   });

//   if (!sermon) {
//     return NextResponse.json({ message: "Not found" }, { status: 404 });
//   }

//   return NextResponse.json(sermon);
// }

// /* ---------------- PUT (ADMIN + EDITOR) ---------------- */
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const user = await requireAdmin(["admin", "editor"]);
//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const { id } = await context.params;
//   const sermonId = Number(id);

//   if (Number.isNaN(sermonId)) {
//     return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
//   }

//   try {
//     const data = await req.json();

//     const existing = await prisma.sermon.findUnique({
//       where: { id: sermonId },
//     });

//     if (!existing) {
//       return NextResponse.json({ message: "Not found" }, { status: 404 });
//     }

//     // ✅ SAFE DATE NORMALIZATION
//     if (data.date) {
//       const d = new Date(data.date);
//       if (isNaN(d.getTime())) {
//         return NextResponse.json(
//           { message: "Invalid date" },
//           { status: 400 }
//         );
//       }
//       data.date = d;
//     }

//     const updated = await prisma.sermon.update({
//       where: { id: sermonId },
//       data,
//     });

//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error("SERMON PUT ERROR:", err);
//     return NextResponse.json(
//       { message: "Failed to update sermon" },
//       { status: 500 }
//     );
//   }
// }

// /* ---------------- DELETE (ADMIN ONLY) ---------------- */
// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const admin = await requireAdmin(["admin"]);
//   if (!admin) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const { id } = await context.params;
//   const sermonId = Number(id);

//   if (Number.isNaN(sermonId)) {
//     return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
//   }

//   await prisma.sermon.delete({
//     where: { id: sermonId },
//   });

//   return NextResponse.json({ success: true });
// }










// // import { NextRequest, NextResponse } from "next/server";
// // import { prisma } from "@/lib/prisma";
// // import { getUserFromToken } from "@/lib/auth";
// // import { cookies } from "next/headers";

// // async function requireAdmin() {
// //   const token = (await cookies()).get("token")?.value;
// //   const user = await getUserFromToken(token);
// //   return user?.role === "admin" ? user : null;
// // }

// // export async function GET(
// //   req: NextRequest,
// //   context: { params: Promise<{ id: string }> }
// // ) {
// //   const { id } = await context.params;

// //   const sermon = await prisma.sermon.findUnique({
// //     where: { id: Number(id) },
// //   });

// //   return NextResponse.json(sermon);
// // }

// // export async function PUT(
// //   req: NextRequest,
// //   context: { params: Promise<{ id: string }> }
// // ) {
// //   if (!(await requireAdmin()))
// //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

// //   const { id } = await context.params;
// //   const data = await req.json();

// //   if (data.date)
// //     data.date = new Date(data.date).toISOString();

// //   const sermon = await prisma.sermon.update({
// //     where: { id: Number(id) },
// //     data,
// //   });

// //   return NextResponse.json(sermon);
// // }

// // export async function DELETE(
// //   req: NextRequest,
// //   context: { params: Promise<{ id: string }> }
// // ) {
// //   if (!(await requireAdmin()))
// //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

// //   const { id } = await context.params;

// //   await prisma.sermon.delete({
// //     where: { id: Number(id) },
// //   });

// //   return NextResponse.json({ success: true });
// // }
