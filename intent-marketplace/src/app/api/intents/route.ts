import { NextResponse } from "next/server";
import { getPendingIntents } from "@/src/lib/intentEngine";

export const dynamic = "force-dynamic";

// Fallback cards used when no DB intents exist yet (fresh deployment / empty table)
const FALLBACK_CARDS = [
  {
    id: "1",
    intent_summary: "Meeting request from Alex regarding Q1 goals",
    proposed_action: "Create calendar event for Friday 2 PM",
    confidence: 0.91,
    reasoning: "Alex is a frequent collaborator and 'Friday 2 PM' was explicitly mentioned.",
    source: "Email",
  },
  {
    id: "2",
    intent_summary: "Professor emailed about study group",
    proposed_action: "Schedule study session in Library",
    confidence: 0.87,
    reasoning: "The email mentions a need for a study session and the library is your usual location.",
    source: "Gmail",
  },
  {
    id: "3",
    intent_summary: "Loose reminder: 'Buy milk soon'",
    proposed_action: "Add 'Buy milk' to grocery list",
    confidence: 0.55,
    reasoning: "Detected a grocery item but the timeframe 'soon' is ambiguous.",
    source: "Note",
  },
];

export async function GET() {
  try {
    const intents = await getPendingIntents();

    if (intents.length === 0) {
      return NextResponse.json({ cards: FALLBACK_CARDS });
    }

    const cards = intents.map((intent) => ({
      id:              intent.id,
      intent_summary:  intent.intent_summary,
      proposed_action: intent.possible_actions[0] ?? intent.intent_summary,
      confidence:      intent.confidence,
      reasoning:       intent.reasoning,
      source:          intent.source,
    }));

    return NextResponse.json({ cards });
  } catch (err) {
    console.error("[GET /api/intents] DB error — falling back to mock data:", err);
    return NextResponse.json({ cards: FALLBACK_CARDS });
  }
}
