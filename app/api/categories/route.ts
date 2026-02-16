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

/* ---------------- GET ALL ---------------- */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("CATEGORY GET ERROR:", err);
    return NextResponse.json(
      { message: "Failed to load categories" },
      { status: 500 }
    );
  }
}

/* ---------------- CREATE ---------------- */
export async function POST(req: NextRequest) {
  if (!(await requireEditorOrAdmin())) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json("Category name required", { status: 400 });
    }

    const created = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    // ✅ unique constraint
    if (err.code === "P2002") {
      return NextResponse.json("Category already exists", { status: 409 });
    }

    console.error("CATEGORY POST ERROR:", err);
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}
