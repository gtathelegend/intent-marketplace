import { NextRequest, NextResponse } from "next/server";
import { extractIntent } from "@/src/lib/intent";
import { db } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field in request body" },
        { status: 400 }
      );
    }

    // 1. Extract intent using Groq LLM
    const extraction = await extractIntent(text);

    // 2. Insert into PostgreSQL intents table
    const result = await db.findOne(
      `INSERT INTO intents (source_text, intent_summary, entities, possible_actions, confidence)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        text,
        extraction.intent_summary,
        JSON.stringify(extraction.entities),
        JSON.stringify(extraction.possible_actions),
        extraction.confidence,
      ]
    );

    // 3. Return the stored intent object
    return NextResponse.json({
        ...extraction,
        id: result?.id,
        created_at: result?.created_at
    });

  } catch (error: any) {
    console.error("Intent Extraction & Save Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
