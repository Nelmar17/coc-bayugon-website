import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function POST() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { onlineAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
