import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { Token } from "@/lib/models/Token";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  await User.deleteOne({ _id: session.user.id });
  await Token.deleteMany({ userId: session.user.id });

  return NextResponse.json({ ok: true });
}
