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

/* ---------------- GET ONE ---------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIX
  const studyId = Number(id);

  if (Number.isNaN(studyId)) {
    return NextResponse.json("Invalid ID", { status: 400 });
  }

  try {
    const item = await prisma.bibleStudy.findUnique({
      where: { id: studyId },
      include: {
        category: true,
      },
    });

    if (!item) {
      return NextResponse.json("Not found", { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("BIBLE STUDY GET ONE ERROR:", err);
    return NextResponse.json(
      { message: "Failed to load Bible Study" },
      { status: 500 }
    );
  }
}

/* ---------------- UPDATE ---------------- */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireEditorOrAdmin())) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { id } = await context.params; // ✅ FIX
  const studyId = Number(id);

  if (Number.isNaN(studyId)) {
    return NextResponse.json("Invalid ID", { status: 400 });
  }

  try {
    const data = await req.json();

    // ✅ normalize studyDate
    if (data.studyDate) {
      const d = new Date(data.studyDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json("Invalid studyDate", { status: 400 });
      }
      data.studyDate = d;
    }

    const updated = await prisma.bibleStudy.update({
      where: { id: studyId },
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

        studyDate: data.studyDate,
        categoryId: data.categoryId ?? null,
      },

      include: {
        category: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("BIBLE STUDY PUT ERROR:", err);
    return NextResponse.json(
      { message: "Failed to update Bible Study" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE (ADMIN ONLY) ---------------- */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = (await cookies()).get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user || user.role !== "admin") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { id } = await context.params; // ✅ FIX
  const studyId = Number(id);

  if (Number.isNaN(studyId)) {
    return NextResponse.json("Invalid ID", { status: 400 });
  }

  try {
    await prisma.bibleStudy.delete({
      where: { id: studyId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BIBLE STUDY DELETE ERROR:", err);
    return NextResponse.json(
      { message: "Failed to delete Bible Study" },
      { status: 500 }
    );
  }
}
