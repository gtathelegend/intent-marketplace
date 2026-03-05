import { NextRequest, NextResponse } from "next/server";
import { CalendarAgent } from "@/src/agents/calendarAgent";
import { EmailAgent } from "@/src/agents/emailAgent";
import { TaskAgent } from "@/src/agents/taskAgent";
import { logAction } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { agent_name, intent } = await req.json();

    if (!agent_name || !intent) {
      return NextResponse.json({ error: "Missing agent_name or intent" }, { status: 400 });
    }

    console.log(`[ExecuteAPI] Routing to ${agent_name}...`);

    let result;

    if (agent_name.toLowerCase().includes("calendar")) {
      result = await CalendarAgent.execute(intent);
    } else if (agent_name.toLowerCase().includes("email")) {
      result = await EmailAgent.execute(intent);
    } else if (agent_name.toLowerCase().includes("task")) {
      result = await TaskAgent.execute(intent);
    } else {
      // Generic fallback for Research Agent / unknown agents
      await new Promise((resolve) => setTimeout(resolve, 800));
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
