import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

export async function sendAdminEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  await transporter.sendMail({
    from: `"Church Website" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `📩 Contact: ${data.subject}`,
    html: `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || "-"}</p>
      <hr />
      <p>${data.message}</p>
    `,
  });
}

export async function sendAutoReply(email: string, firstName: string) {
  await transporter.sendMail({
    from: `"Church of Christ" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "We received your message",
    html: `
      <p>Hello ${firstName},</p>
      <p>Thank you for contacting the Church of Christ.</p>
      <p>We have received your message and will respond soon.</p>
      <br />
      <p>— Church Of Christ - Bayugon </p>
    `,
  });
}


export async function sendAdminReply(
  to: string,
  subject: string,
  body: string
) {
  await transporter.sendMail({
    from: `"Church Of Christ" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Re: ${subject}`,
    html: `
      <p>${body}</p>
      <br />
      <p>— Church Of Christ - Bayugon</p>
    `,
  });
}

