import { NextRequest, NextResponse } from "next/server";
import { extractIntent } from "@/src/lib/intent";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field in request body" },
        { status: 400 }
      );
    }

    const extraction = await extractIntent(text);

    return NextResponse.json(extraction);
  } catch (error: any) {
    console.error("Intent Extraction Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
