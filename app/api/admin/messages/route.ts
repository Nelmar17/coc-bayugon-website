export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const showResolved = searchParams.get("resolved") === "true";

    const messages = await prisma.contactMessage.findMany({
      where: showResolved ? {} : { resolved: false },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("MESSAGES LIST ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
