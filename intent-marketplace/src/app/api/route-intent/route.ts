import { NextRequest, NextResponse } from "next/server";
import { matchIntentToAgents } from "@/src/lib/router";

export async function POST(req: NextRequest) {
  try {
    const { intent_summary } = await req.json();

    if (!intent_summary || typeof intent_summary !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'intent_summary' field" },
        { status: 400 }
      );
    }

    const matches = await matchIntentToAgents(intent_summary);

    return NextResponse.json({
      agents: matches.map((m) => ({
        agent_id: m.agent_id,
        name: m.name,
        confidence: parseFloat(m.score.toFixed(4)),
      })),
    });
  } catch (error: any) {
    console.error("Vector Routing Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
