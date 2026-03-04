import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

const from = process.env.EMAIL_FROM ?? "NicheMRR <noreply@yourdomain.com>";
const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${baseUrl}/api/auth/verify-email?token=${token}`;
  await getResend().emails.send({
    from,
    to,
    subject: "Verify your NicheMRR account",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:#09090b;padding:24px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">📊 NicheMRR</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#09090b;">Verify your email</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
              Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.
            </p>
            <a href="${link}" style="display:inline-block;background:#09090b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
              Verify email address
            </a>
            <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;">
              Or copy this link into your browser:<br>
              <span style="color:#09090b;word-break:break-all;">${link}</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f4f4f5;">
            <p style="margin:0;font-size:12px;color:#71717a;">If you didn't create a NicheMRR account, you can safely ignore this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${baseUrl}/reset-password?token=${token}`;
  await getResend().emails.send({
    from,
    to,
    subject: "Reset your NicheMRR password",
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
<p><a href="${link}">${link}</a></p>`,
  });
}
