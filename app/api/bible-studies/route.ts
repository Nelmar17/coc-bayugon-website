import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* ---------------- AUTH ---------------- */
async function requireEditorOrAdmin() {
  const token = (await cookies()).get("token")?.value;
  const user = await getUserFromToken(token);
  return user && ["admin", "editor"].includes(user.role) ? user : null;
}

/* ---------------- GET (PUBLIC + FILTERS) ---------------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const categoryId =
      searchParams.get("category") ?? // Ensure categoryId is being read correctly
      searchParams.get("categoryId");

    const speaker = searchParams.get("speaker");
    const excludeId = searchParams.get("excludeId");
    const limit = Number(searchParams.get("limit") ?? 0);

    const where: any = {};

    if (categoryId && !Number.isNaN(Number(categoryId))) {
      where.categoryId = Number(categoryId); // Ensure proper numeric filtering
    }

    if (speaker) {
      where.speaker = speaker;
    }

    if (excludeId && !Number.isNaN(Number(excludeId))) {
      where.id = { not: Number(excludeId) };
    }

    // 1️⃣ PINNED (always show)
    const pinned = await prisma.bibleStudy.findMany({
      where: {
        isPinned: true,
      },
      orderBy: {
        studyDate: "desc",
      },
      include: {
        category: true,
      },
    });

    // 2️⃣ NORMAL (filtered)
    const normal = await prisma.bibleStudy.findMany({
      where: {
        ...where,
        isPinned: false,
      },
      orderBy: {
        studyDate: "desc",
      },
      take: limit > 0 ? limit : undefined,
      include: {
        category: true,
      },
    });

    return NextResponse.json([...pinned, ...normal]);
  } catch (err) {
    console.error("BIBLE STUDY GET ERROR:", err);
    return NextResponse.json(
      { message: "Failed to load Bible Studies" },
      { status: 500 }
    );
  }
}


// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const categoryId =
//     searchParams.get("categoryId") ??
//     searchParams.get("category");

//     const speaker = searchParams.get("speaker");
//     const excludeId = searchParams.get("excludeId");
//     const limit = Number(searchParams.get("limit") ?? 0);

//     const where: any = {};

//     if (categoryId && !Number.isNaN(Number(categoryId))) {
//       where.categoryId = Number(categoryId);
//     }

//     if (speaker) {
//       where.speaker = speaker;
//     }

//     if (excludeId && !Number.isNaN(Number(excludeId))) {
//       where.id = { not: Number(excludeId) };
//     }

//     // 1️⃣ PINNED (always show)
//     const pinned = await prisma.bibleStudy.findMany({
//       where: {
//         isPinned: true,
//       },
//       orderBy: {
//         studyDate: "desc",
//       },
//       include: {
//         category: true,
//       },
//     });

//     // 2️⃣ NORMAL (filtered)
//     const normal = await prisma.bibleStudy.findMany({
//       where: {
//         ...where,
//         isPinned: false,
//       },
//       orderBy: {
//         studyDate: "desc",
//       },
//       take: limit > 0 ? limit : undefined,
//       include: {
//         category: true,
//       },
//     });

//     // 3️⃣ MERGE
//     return NextResponse.json([...pinned, ...normal]);

//     // const items = await prisma.bibleStudy.findMany({
//     //   where,
//     //     orderBy: [
//     //     { isPinned: "desc" },   // pinned first
//     //     { studyDate: "desc" },  // then newest
//     //   ],
//     //   take: limit > 0 ? limit : undefined,
//     //   include: {
//     //     category: true,
//     //   },
//     // });
//     // return NextResponse.json(items);

//   } catch (err) {
//     console.error("BIBLE STUDY GET ERROR:", err);
//     return NextResponse.json(
//       { message: "Failed to load Bible Studies" },
//       { status: 500 }
//     );
//   }
// }

/* ---------------- CREATE ---------------- */
export async function POST(req: NextRequest) {
  if (!(await requireEditorOrAdmin())) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.json();

    const studyDate = new Date(data.studyDate);
    if (isNaN(studyDate.getTime())) {
      return NextResponse.json("Invalid studyDate", { status: 400 });
    }

    const created = await prisma.bibleStudy.create({
      data: {
        title: data.title,
        speaker: data.speaker ?? null,
        description: data.description ?? null,
        outline: data.outline ?? null,
        content: data.content ?? null,

        isPinned: data.isPinned ?? false,
        imageUrl: data.imageUrl ?? null,
        imageId: data.imageId ?? null,
        audioUrl: data.audioUrl ?? null,
        audioId: data.audioId ?? null,
        videoUrl: data.videoUrl ?? null,
        videoId: data.videoId ?? null,
        documentUrl: data.documentUrl ?? null,
        documentId: data.documentId ?? null,

        studyDate,
        categoryId: data.categoryId ?? null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("BIBLE STUDY POST ERROR:", err);
    return NextResponse.json(
      { message: "Failed to create Bible Study" },
      { status: 500 }
    );
  }
}



















// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
// import { getUserFromToken } from "@/lib/auth";

// /* ---------------- AUTH ---------------- */
// async function requireEditorOrAdmin() {
//   const token = (await cookies()).get("token")?.value;
//   const user = await getUserFromToken(token);
//   return user && ["admin", "editor"].includes(user.role) ? user : null;
// }

// /* ---------------- GET ALL (WITH CATEGORY FILTER) ---------------- */
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const category = searchParams.get("category");

//   const where: any = {};

//   // ✅ APPLY FILTER IF CATEGORY EXISTS
//   if (category && !Number.isNaN(Number(category))) {
//     where.categoryId = Number(category);
//   }

//   const items = await prisma.bibleStudy.findMany({
//     where,
//     orderBy: { studyDate: "desc" },
//     include: {
//       category: true,
//     },
//   });

//   return NextResponse.json(items);
// }

// /* ---------------- CREATE ---------------- */
// export async function POST(req: NextRequest) {
//   if (!(await requireEditorOrAdmin())) {
//     return NextResponse.json("Unauthorized", { status: 401 });
//   }

//   try {
//     const data = await req.json();

//     // ✅ validate studyDate
//     const studyDate = new Date(data.studyDate);
//     if (isNaN(studyDate.getTime())) {
//       return NextResponse.json("Invalid studyDate", { status: 400 });
//     }

//     const created = await prisma.bibleStudy.create({
//       data: {
//         title: data.title,
//         speaker: data.speaker ?? null,
//         description: data.description ?? null,
//         outline: data.outline ?? null,
//         content: data.content ?? null,

//         imageUrl: data.imageUrl ?? null,
//         imageId: data.imageId ?? null,

//         audioUrl: data.audioUrl ?? null,
//         audioId: data.audioId ?? null,

//         videoUrl: data.videoUrl ?? null,
//         videoId: data.videoId ?? null,

//         documentUrl: data.documentUrl ?? null,
//         documentId: data.documentId ?? null,

//         studyDate,
//         categoryId: data.categoryId ?? null, // ✅ CATEGORY
//       },
//       include: {
//         category: true,
//       },
//     });

//     return NextResponse.json(created, { status: 201 });
//   } catch (err) {
//     console.error("BIBLE STUDY POST ERROR:", err);
//     return NextResponse.json(
//       { message: "Failed to create Bible Study" },
//       { status: 500 }
//     );
//   }
// }
