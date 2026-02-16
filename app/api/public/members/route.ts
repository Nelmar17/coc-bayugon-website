export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

/* =========================
   AUTH (PUBLIC READ)
   ========================= */
async function requireLogin() {
  const token = (await cookies()).get("token")?.value ?? null;
  const user = await getUserFromToken(token);
  return user;
}

/* =========================
   GET PUBLIC MEMBERS
   ========================= */
export async function GET() {
  const user = await requireLogin();
  if (!user) {
    // ❗ IMPORTANT: no error, just empty
    return NextResponse.json([]);
  }

  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        congregation: true,
        birthday: true,        // ✅ ADD THIS
        dateOfBaptism: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json(members);
  } catch (err) {
    console.error("❌ PUBLIC MEMBERS FETCH FAILED:", err);
    return NextResponse.json([], { status: 200 });
  }
}
