import { NextRequest, NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
  }

  await prisma.newsletterSubscriber.create({
    data: { email, name },
  });

  // ▶ Send welcome email
  await sendMail(
    email,
    "Thank you for subscribing!",
    `
      <h2>Welcome!</h2>
      <p>Hi ${name || "there"}, thank you for subscribing to our newsletter!</p>
      <p>You will now receive updates from the Church of Christ website.</p>
    `
  );

  return NextResponse.json({ message: "Subscribed" }, { status: 201 });
}
