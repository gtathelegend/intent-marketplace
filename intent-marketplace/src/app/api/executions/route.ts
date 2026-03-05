import { NextResponse } from "next/server";
import { getExecutions } from "@/src/lib/db";

/**
 * GET /api/executions
 * Returns in-memory execution logs (newest first).
 * When a real database is configured these can be swapped for pg queries.
 */
export async function GET() {
  try {
    const executions = getExecutions();
    return NextResponse.json({ executions });
  } catch (error: any) {
    console.error("[ExecutionsAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

