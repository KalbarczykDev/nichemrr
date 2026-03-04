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
    html: `<p>Click the link below to verify your email address. This link expires in 24 hours.</p>
<p><a href="${link}">${link}</a></p>`,
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
