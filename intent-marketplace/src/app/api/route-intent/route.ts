import { NextRequest, NextResponse } from "next/server";
import { matchIntentToAgents } from "@/src/lib/router";

/**
 * POST: Match intent summary to best agents using vector similarity
 */
export async function POST(req: NextRequest) {
  try {
    const { intent_summary } = await req.json();

    if (!intent_summary || typeof intent_summary !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'intent_summary' field" },
        { status: 400 }
      );
    }

    // Call Step 6 Vector Router
    const matches = await matchIntentToAgents(intent_summary);

    // Format for UI
    const response = {
      agents: matches.map((m) => ({
        agent_id: m.agent_id,
        name: m.name,
        confidence: parseFloat(m.score?.toFixed(4) || '0'),
      })),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Vector Routing Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
