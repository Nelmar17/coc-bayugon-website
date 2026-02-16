import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

export async function sendMail(
  to: string | string[],
  subject: string,
  html: string
) {
  await transporter.sendMail({
    from: `"Church of Christ" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}




// import nodemailer from "nodemailer";

// const host = process.env.SMTP_HOST!;
// const port = Number(process.env.SMTP_PORT || "587");
// const user = process.env.SMTP_USER!;
// const pass = process.env.SMTP_PASS!;
// const from = process.env.FROM_EMAIL || process.env.SMTP_USER!;

// export const transporter = nodemailer.createTransport({
//   host,
//   port,
//   secure: port === 465,
//   auth: { user, pass },
// });

// export async function sendMail(to: string | string[], subject: string, html: string) {
//   await transporter.sendMail({
//     from,
//     to,
//     subject,
//     html,
//   });
// }
