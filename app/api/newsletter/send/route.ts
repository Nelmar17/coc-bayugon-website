import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { newsletterTemplate } from "@/lib/emailTemplate";

export async function POST(req: Request) {
  const { subject, body } = await req.json();

  if (!subject || !body) {
    return NextResponse.json(
      { message: "Subject & body required" },
      { status: 400 }
    );
  }

  const subs = await prisma.newsletterSubscriber.findMany();
  const emails = subs.map((s:any) => s.email);

  if (emails.length === 0) {
    return NextResponse.json({ message: "No subscribers" });
  }

  // Generate the HTML email using your template
  const html = newsletterTemplate(subject, body);

  // Send the email
  await sendMail(
    emails,
    subject,
    html
  );

  return NextResponse.json({
    message: `Sent to ${emails.length} subscribers`,
  });
}
