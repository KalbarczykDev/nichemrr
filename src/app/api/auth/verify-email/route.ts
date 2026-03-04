import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Token } from "@/lib/models/Token";
import { User } from "@/lib/models/User";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=INVALID_TOKEN", req.url));
  }

  await connectToDatabase();

  const record = await Token.findOne({ token, type: "email_verification" });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=INVALID_TOKEN", req.url));
  }

  await User.updateOne({ _id: record.userId }, { emailVerified: true });
  await Token.deleteOne({ _id: record._id });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
