export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminEmail, sendAutoReply } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      captchaToken,
    } = await req.json();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !subject ||
      !message ||
      !captchaToken
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    /* -------------------------------
     * VERIFY reCAPTCHA (SERVER SIDE)
     * ------------------------------- */
    const verify = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
      }
    ).then((r) => r.json());

    if (!verify.success) {
      return NextResponse.json(
        { message: "Captcha verification failed" },
        { status: 400 }
      );
    }

    /* -------------------------------
     * SAVE MESSAGE
     * ------------------------------- */
    await prisma.contactMessage.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
      },
    });

    /* -------------------------------
     * EMAILS
     * ------------------------------- */
    await sendAdminEmail({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      subject,
      message,
    });

    await sendAutoReply(email, firstName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
