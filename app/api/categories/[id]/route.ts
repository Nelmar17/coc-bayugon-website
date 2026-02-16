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
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return NextResponse.json("Invalid ID", { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return NextResponse.json("Not found", { status: 404 });
  }

  return NextResponse.json(category);
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
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return NextResponse.json("Invalid ID", { status: 400 });
  }

  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json("Category name required", { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name: name.trim() },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json("Category already exists", { status: 409 });
    }

    console.error("CATEGORY PUT ERROR:", err);
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE (ADMIN ONLY + PROTECTED) ---------------- */
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
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return NextResponse.json("Invalid ID", { status: 400 });
  }

  // 🔒 CHECK IF CATEGORY IS USED
  const count = await prisma.bibleStudy.count({
    where: { categoryId },
  });

  if (count > 0) {
    return NextResponse.json(
      "Cannot delete category: it is used by Bible Studies",
      { status: 409 }
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return NextResponse.json({ success: true });
}
