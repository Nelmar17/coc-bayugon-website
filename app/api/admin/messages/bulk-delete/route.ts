export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "No messages selected" },
        { status: 400 }
      );
    }

    await prisma.contactReply.deleteMany({
      where: { messageId: { in: ids } },
    });

    await prisma.contactMessage.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BULK DELETE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
