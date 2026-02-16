export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user || user.role !== "admin") {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.contactMessage.count({
    where: {
      read: false,
      resolved: false,
    },
  });

  return NextResponse.json({ count });
}
