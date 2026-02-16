export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ IMPORTANT FIX
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { message: "Invalid message id" },
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

    await prisma.contactReply.deleteMany({
      where: { messageId: id },
    });

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
