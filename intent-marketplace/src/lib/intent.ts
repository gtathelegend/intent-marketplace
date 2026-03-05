import { groq } from "@/src/lib/groq";

/**
 * Interface for the expected JSON response from the LLM
 */
export interface IntentExtractionResponse {
  intent_summary: string;
  entities: string[];
  possible_actions: string[];
  confidence: number;
  reasoning: string; // Added reasoning for the safety layer
}

/**
 * Basic sanitization to prevent prompt injection
 */
function sanitizeInput(text: string): string {
  // Remove potential prompt-breaking characters and common injection patterns
  return text
    .replace(/<[^>]*>?/gm, "") // Remove HTML-like tags
    .replace(/system:|user:|assistant:/gi, "") // Remove role indicators
    .replace(/ignore previous instructions/gi, "[REDACTED]")
    .trim();
}

/**
 * Common logic for extracting intent from any text source
 */
export async function extractIntent(text: string): Promise<IntentExtractionResponse> {
  const sanitizedText = sanitizeInput(text);

  if (!sanitizedText) {
    throw new Error("Input text is empty after sanitization");
  }

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an AI that extracts user intent from text. 
        Analyze the input text and provide a structured JSON response.
        Include a 'reasoning' field explaining why you chose the summary and suggested actions.
        The response must be valid JSON and follow this schema exactly:
        {
          "intent_summary": "A concise summary of the user's intent",
          "entities": ["list", "of", "important", "entities"],
          "possible_actions": ["list", "of", "suggested", "next", "steps"],
          "confidence": 0.85,
          "reasoning": "A brief explanation of why this action was proposed"
        }
        Return ONLY the JSON object.`,
      },
      {
        role: "user",
        content: `Extract intent from this text: "${sanitizedText}"`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response content from Groq API");
  }

  return JSON.parse(content);
}
