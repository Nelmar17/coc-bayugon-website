import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { serialize } from "cookie";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ⭐ CORRECT PAYLOAD — MUST MATCH JwtPayload EXACTLY
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        role: user.role,
      },
    });

    // ⭐ USE .set(), NOT .append()
    response.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    );

    return response;

  } catch (error) {
    console.error("LOGIN ERROR →", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
