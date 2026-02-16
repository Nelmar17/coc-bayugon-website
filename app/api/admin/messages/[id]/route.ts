export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    /* ✅ NEXT 16 FIX */
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

    const message = await prisma.contactMessage.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    });



    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    /* mark as read */
    if (!message.read) {
      await prisma.contactMessage.update({
        where: { id },
        data: { read: true },
      });
    }

    return NextResponse.json(message);
  } catch (err) {
    console.error("GET MESSAGE ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
