import { NextRequest, NextResponse } from "next/server";
import { CalendarAgent } from "@/src/agents/calendarAgent";
import { EmailAgent } from "@/src/agents/emailAgent";
import { TaskAgent } from "@/src/agents/taskAgent";
import { logAction } from "@/src/lib/db";

/**
 * POST: Execute an agent on an intent.
 * Body: { agent_name: string, intent: IntentCardData | string }
 */
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      result = {
        status: "success",
        message: `Executed via ${agent_name}: ${intent.intent_summary ?? intent}`,
      };
    }

    await logAction({
      agent_name,
      intent_summary: intent.intent_summary ?? String(intent),
      status: result.status === "success" ? "success" : "failed",
      result_message: result.message,
      source_text: intent.source ?? "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ExecuteAPI] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

