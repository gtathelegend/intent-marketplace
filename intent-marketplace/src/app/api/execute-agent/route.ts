import { NextRequest, NextResponse } from "next/server";
import { CalendarAgent } from "@/src/agents/calendarAgent";

export async function POST(req: NextRequest) {
  try {
    const { agent_name, intent } = await req.json();

    if (!agent_name || !intent) {
      return NextResponse.json({ error: "Missing agent_name or intent" }, { status: 400 });
    }

    console.log(`[ExecuteAPI] Routing to ${agent_name}...`);

    // In a real app, this would dynamically route to the correct agent module
    // For this prototype, we'll route everything to the CalendarAgent if it's calendar-related
    // or just return a generic success for others.
    if (agent_name.toLowerCase().includes("calendar")) {
      const result = await CalendarAgent.execute(intent);
      return NextResponse.json(result);
    }

    // Mock response for other agents
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({
      status: "success",
      message: `Executed via ${agent_name}: ${intent.intent_summary || intent}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
