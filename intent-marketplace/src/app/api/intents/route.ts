import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";

/**
 * GET: Fetch all pending intents
 */
export async function GET() {
  try {
    const result = await db.query(
      `SELECT * FROM intents WHERE status = 'pending' ORDER BY created_at DESC`
    );

    // Map DB fields to UI-friendly structure if needed
    const cards = result.rows.map(row => ({
      id: row.id,
      intent_summary: row.intent_summary,
      proposed_action: Array.isArray(row.possible_actions) 
        ? row.possible_actions[0] 
        : (JSON.parse(row.possible_actions || '[]')[0] || "No suggested action"),
      confidence: row.confidence,
      reasoning: "Extracted from your source text.",
      source: "Database", // You could store actual source in DB
    }));

    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error("Fetch Intents Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
