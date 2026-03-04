import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { Token } from "@/lib/models/Token";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email, password, tosAccepted } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!tosAccepted) {
    return NextResponse.json({ error: "You must accept the Terms of Service" }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    emailVerified: false,
    provider: "credentials",
    tosAcceptedAt: new Date(),
  });

  const token = generateToken();
  await Token.create({
    token,
    type: "email_verification",
    userId: user._id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendVerificationEmail(user.email, token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
