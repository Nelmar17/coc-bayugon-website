import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import { newsletterTemplate } from "@/lib/emailTemplate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 🔒 always return success (no email enumeration)
    if (!email) {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    // 🔑 generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 15), // 15 min
      },
    });

    // const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const resetUrl = `${baseUrl}/reset-password/${token}`;


    await sendMail(
      user.email,
      "Reset your password",
      newsletterTemplate(
        "Password Reset",
        `
        <p>Hello ${user.name ?? ""},</p>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetUrl}" style="color:#2563eb;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in <strong>15 minutes</strong>.</p>
        `
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
