import { NextResponse } from "next/server";

// Mock intent cards — replace with real DB query once a database is connected.
const MOCK_CARDS = [
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
  return NextResponse.json({ cards: MOCK_CARDS });
}
