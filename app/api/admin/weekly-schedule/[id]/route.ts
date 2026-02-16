import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return false;
  const user = await getUserFromToken(token);
  return user?.role === "admin";
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  const updated = await prisma.weeklySchedule.update({
    where: { id: Number(id) },
    data: {
      day: body.day,
      title: body.title,
      time: body.time,
      order: Number(body.order ?? 0),
      isVisible: Boolean(body.isVisible),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  await prisma.weeklySchedule.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
