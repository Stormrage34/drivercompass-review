import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Unauthenticated liveness/readiness probe for the pilot deployment.
 * Returns no configuration, versions or personal data.
 */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json(
      { status: "ok", database: "up", checkedAt: new Date().toISOString() },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable", database: "down", checkedAt: new Date().toISOString() },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
