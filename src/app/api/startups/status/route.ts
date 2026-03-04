import { fetchStatus } from "@/lib/fetchStatus";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(fetchStatus);
}
