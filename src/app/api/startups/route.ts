import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return Response.json({ error: "Missing API key" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const upstream = `https://trustmrr.com/api/v1/startups?${searchParams}`;

  const res = await fetch(upstream, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    next: { revalidate: 0 },
  });

  const body = await res.json();
  return Response.json(body, { status: res.status });
}
