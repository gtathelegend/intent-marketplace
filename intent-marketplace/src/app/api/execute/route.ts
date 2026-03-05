import { NextResponse } from "next/server";
import { getIntentById, updateIntentStatus } from "@/src/lib/intentEngine";
import { matchIntentToAgents } from "@/src/lib/router";
import { logAction } from "@/src/lib/db";
import { CalendarAgent } from "@/src/agents/calendarAgent";
import { EmailAgent } from "@/src/agents/emailAgent";
import { TaskAgent } from "@/src/agents/taskAgent";

/** Pick the right agent module by name. */
function resolveAgent(name: string) {
  const n = name.toLowerCase();
  if (n.includes("calendar")) return CalendarAgent;
  if (n.includes("email"))    return EmailAgent;
  if (n.includes("task"))     return TaskAgent;
  return null;
}

/**
 * POST /api/execute
 * Body: { intent_id: string }
 *
 * Full server-side pipeline:
 *  1. Load intent from DB
 *  2. Route to best matching agent
 *  3. Execute the agent
 *  4. Persist execution log
 *  5. Mark intent as approved
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { intent_id } = body as Record<string, unknown>;

  if (!intent_id || typeof intent_id !== "string") {
    return NextResponse.json(
      { error: "intent_id (string) is required" },
      { status: 400 }
    );
  }

  const intent = await getIntentById(intent_id);
  if (!intent) {
    return NextResponse.json({ error: "Intent not found" }, { status: 404 });
  }

  const agents = await matchIntentToAgents(intent.intent_summary);
  const best = agents[0];

  if (!best) {
    return NextResponse.json(
      { error: "No suitable agent found for this intent" },
      { status: 422 }
    );
  }

  const agentModule = resolveAgent(best.name);
  let status: "success" | "failed" = "failed";
  let message = `Agent "${best.name}" not found`;

  if (agentModule) {
    try {
      const result = await agentModule.execute(intent);
      status  = result.status === "success" ? "success" : "failed";
      message = result.message;
    } catch (err: unknown) {
      message = err instanceof Error ? err.message : String(err);
    }
  }

  await logAction({
    agent_name:      best.name,
    intent_summary:  intent.intent_summary,
    status,
    result_message:  message,
    source_text:     intent.source_text,
  });

  await updateIntentStatus(intent_id, "approved");

  return NextResponse.json({
    status,
    message,
    agent:     best.name,
    intent_id,
  });
}
