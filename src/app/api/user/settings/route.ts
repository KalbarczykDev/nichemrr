import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongoose";
import { UserSettings } from "@/lib/models/UserSettings";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const settings = await UserSettings.findOne({ userId: session.user.id });

  return NextResponse.json({
    theme: settings?.theme ?? "system",
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { theme } = body;

  if (!["light", "dark", "system"].includes(theme)) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  await connectToDatabase();
  await UserSettings.findOneAndUpdate(
    { userId: session.user.id },
    { theme },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true });
}
