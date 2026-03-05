import { NextRequest, NextResponse } from "next/server";
import { matchIntentToAgents, Agent } from "@/src/lib/router";
import { generateEmbedding } from "@/src/lib/embeddings";

// Mock agents data with descriptions to generate embeddings for matching
const MOCK_AGENTS_CONFIG = [
  {
    agent_id: "calendar-agent",
    name: "Calendar Agent",
    description: "Schedules meetings, manages calendar events, and checks availability across time zones.",
    capabilities: ["create_event", "check_availability", "delete_event"],
  },
  {
    agent_id: "task-agent",
    name: "Task Agent",
    description: "Creates to-do lists, manages project tasks, sets deadlines, and tracks progress in productivity tools.",
    capabilities: ["create_task", "update_status", "set_reminder"],
  },
  {
    agent_id: "research-agent",
    name: "Research Agent",
    description: "Performs web searches, summarizes long articles, finds specific data points, and compiles reports.",
    capabilities: ["web_search", "summarize", "find_data"],
  },
  {
    agent_id: "email-agent",
    name: "Email Agent",
    description: "Drafts professional emails, organizes inboxes, filters spam, and sets up automated replies.",
    capabilities: ["draft_email", "send_email", "archive_thread"],
  },
];

export async function POST(req: NextRequest) {
  try {
    const { intent_summary, vector } = await req.json();

    if (!intent_summary || typeof intent_summary !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'intent_summary' field" },
        { status: 400 }
      );
    }

    // 1. Prepare agents with embeddings
    // In a real application, these embeddings would be pre-calculated and stored in a vector database.
    const agents: Agent[] = await Promise.all(
      MOCK_AGENTS_CONFIG.map(async (config) => ({
        ...config,
        embedding: await generateEmbedding(config.description),
      }))
    );

    // 2. Call the router to find matches
    // If a vector was already provided, we could use it, but the matchIntentToAgents 
    // function handles generation if needed. For this implementation, we'll re-generate 
    // or use the summary to ensure consistency with our current deterministic hashing.
    const matches = await matchIntentToAgents(intent_summary, agents);

    // 3. Format the response as requested
    const response = {
      agents: matches.map((m) => ({
        name: m.agent.name,
        confidence: parseFloat(m.score.toFixed(4)),
      })),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Intent Routing Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
