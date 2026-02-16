import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return false;
  const user = await getUserFromToken(token);
  return user?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const data = await prisma.weeklySchedule.findMany({
    orderBy: [{ day: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const created = await prisma.weeklySchedule.create({
    data: {
      day: body.day,
      title: body.title,
      time: body.time,
      order: Number(body.order ?? 0),
      isVisible: Boolean(body.isVisible),
    },
  });

  return NextResponse.json(created, { status: 201 });
}
