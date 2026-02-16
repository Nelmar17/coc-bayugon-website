// app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(null, { status: 200 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      onlineAt: true,
    },
  });

  return NextResponse.json(dbUser);
}

// update name, email, avatarUrl
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, avatarUrl } = body as {
    name?: string;
    email?: string;
    avatarUrl?: string;
  };

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
