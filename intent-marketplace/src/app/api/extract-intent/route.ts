import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";

/**
 * Interface for the expected JSON response from the LLM
 */
interface IntentExtractionResponse {
  intent_summary: string;
  entities: string[];
  possible_actions: string[];
  confidence: number;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field in request body" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI that extracts user intent from text. 
          Analyze the input text and provide a structured JSON response.
          The response must be valid JSON and follow this schema exactly:
          {
            "intent_summary": "A concise summary of the user's intent",
            "entities": ["list", "of", "important", "entities", "like", "dates", "names", "tasks"],
            "possible_actions": ["list", "of", "suggested", "next", "steps"],
            "confidence": 0.85 (a number between 0 and 1 representing your certainty)
          }
          Return ONLY the JSON object.`,
        },
        {
          role: "user",
          content: `Extract intent from this text: "${text}"`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for consistent results
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response content from Groq API");
    }

    const extraction: IntentExtractionResponse = JSON.parse(content);

    return NextResponse.json(extraction);
  } catch (error: any) {
    console.error("Intent Extraction Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
