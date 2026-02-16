export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  const user = await getUserFromToken(token);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email } = await req.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, email },
  });

  return NextResponse.json(updated);
}
