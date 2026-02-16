export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminReply } from "@/lib/email";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function POST(
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

    const { body } = await req.json();
    if (!body || !body.trim()) {
      return NextResponse.json(
        { message: "Reply body required" },
        { status: 400 }
      );
    }

    const msg = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!msg) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    /* ✅ SAVE REPLY */
    await prisma.contactReply.create({
      data: {
        messageId: id,
        body,
        sentBy: "admin",
      },
    });

    /* ✅ SEND EMAIL */
    await sendAdminReply(msg.email, msg.subject, body);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REPLY ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
