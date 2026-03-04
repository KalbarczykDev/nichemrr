import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { Token } from "@/lib/models/Token";
import { generateToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Always return 200 to avoid email enumeration
  if (!email) return NextResponse.json({ ok: true });

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase(), provider: "credentials" });
    if (user) {
      const token = generateToken();
      await Token.create({
        token,
        type: "password_reset",
        userId: user._id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      await sendPasswordResetEmail(user.email, token);
    }
  } catch {
    // Swallow errors — caller always sees 200
  }

  return NextResponse.json({ ok: true });
}
