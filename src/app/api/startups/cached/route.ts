import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { StartupCache } from "@/lib/models/StartupCache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");

  if (filter !== "all" && filter !== "onSale") {
    return NextResponse.json({ error: "Invalid filter. Must be 'all' or 'onSale'." }, { status: 400 });
  }

  await connectToDatabase();

  const newest = await StartupCache.findOne({}).sort({ cachedAt: -1 }).select("cachedAt").lean();
  if (!newest) {
    return NextResponse.json({ error: "Cache is empty. Run the seed script to populate it." }, { status: 503 });
  }

  const query = filter === "onSale" ? { onSale: true } : {};
  const data = await StartupCache.find(query).lean();

  return NextResponse.json({
    data,
    meta: { count: data.length, cachedAt: newest.cachedAt },
  });
}
