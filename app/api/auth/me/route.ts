import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";


export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;

  const user = await getUserFromToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
}
