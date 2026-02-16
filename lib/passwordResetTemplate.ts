export function passwordResetTemplate(resetUrl: string) {
  return `
  <div style="max-width:600px;margin:auto;font-family:Arial">
    <h2>Password Reset</h2>
    <p>You requested to reset your password.</p>
    <p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 18px;
                background:#0f172a;color:white;
                text-decoration:none;border-radius:6px">
        Reset Password
      </a>
    </p>
    <p>This link expires in 15 minutes.</p>
    <p style="font-size:12px;color:#666">
      If you did not request this, you may ignore this email.
    </p>
  </div>
  `;
}
