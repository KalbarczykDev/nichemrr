import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import { Token } from "@/lib/models/Token";
import { User } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await connectToDatabase();

  const record = await Token.findOne({ token, type: "password_reset" });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne({ _id: record.userId }, { passwordHash });
  await Token.deleteOne({ _id: record._id });

  return NextResponse.json({ ok: true });
}
