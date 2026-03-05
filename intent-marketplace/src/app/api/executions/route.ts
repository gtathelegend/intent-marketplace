import { NextResponse } from "next/server";
import { getExecutions } from "@/src/lib/db";

/**
 * GET /api/executions
 * Returns execution logs from NeonDB (newest first, up to 100 rows).
 */
export async function GET() {
  try {
    const executions = await getExecutions();
    return NextResponse.json({ executions });
  } catch (error: any) {
    console.error("[ExecutionsAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

