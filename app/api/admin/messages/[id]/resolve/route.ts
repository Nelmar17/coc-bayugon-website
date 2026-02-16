export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.contactMessage.update({
      where: { id },
      data: { resolved: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("RESOLVE MESSAGE ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
