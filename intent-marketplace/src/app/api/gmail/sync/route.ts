import { NextRequest, NextResponse } from "next/server";
import { fetchLatestEmails } from "@/src/lib/gmail";
import { extractIntent } from "@/src/lib/intent";

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
    }

    // 1. Fetch latest 10 emails
    const emails = await fetchLatestEmails(access_token);

    // 2. Extract intents for each email
    const intentCards = await Promise.all(
      emails.map(async (email) => {
        try {
          const extraction = await extractIntent(
            `Subject: ${email.subject}\nFrom: ${email.from}\nBody: ${email.body}`
          );
          
          return {
            id: email.id,
            intent_summary: extraction.intent_summary,
            proposed_action: extraction.possible_actions[0] || "No specific action suggested",
            confidence: extraction.confidence,
            source: "Gmail",
            raw_email: {
              subject: email.subject,
              from: email.from,
            }
          };
        } catch (error) {
          console.error(`Failed to extract intent for email ${email.id}:`, error);
          return null;
        }
      })
    );

    // Filter out any failures and return the list of cards
    return NextResponse.json({
      cards: intentCards.filter((card) => card !== null),
    });
  } catch (error: any) {
    console.error("Gmail Sync Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
