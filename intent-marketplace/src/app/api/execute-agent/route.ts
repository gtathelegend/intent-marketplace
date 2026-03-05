import { NextRequest, NextResponse } from "next/server";
import { CalendarAgent } from "@/src/agents/calendarAgent";
import { logAction } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { agent_name, intent } = await req.json();

    if (!agent_name || !intent) {
      return NextResponse.json({ error: "Missing agent_name or intent" }, { status: 400 });
    }

    console.log(`[ExecuteAPI] Routing to ${agent_name}...`);

    let result;

    // In a real app, this would dynamically route to the correct agent module
    if (agent_name.toLowerCase().includes("calendar")) {
      result = await CalendarAgent.execute(intent);
    } else {
      // Mock response for other agents
      await new Promise((resolve) => setTimeout(resolve, 1000));
      result = {
        status: "success",
        message: `Executed via ${agent_name}: ${intent.intent_summary || intent}`,
      };
    }

    // Safety Layer: Log the action in the "database"
    await logAction({
      intent_id: intent.id || "manual",
      agent_name: agent_name,
      intent_summary: intent.intent_summary || "Unknown",
      action_status: result.status,
      confidence: intent.confidence || 0,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ExecuteAPI] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
