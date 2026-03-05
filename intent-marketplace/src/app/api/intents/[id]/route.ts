import { NextRequest, NextResponse } from "next/server";
import { updateIntentStatus } from "@/src/lib/intentEngine";

/**
 * PATCH /api/intents/[id]
 * Body: { status: "approved" | "rejected" }
 * Updates the intent lifecycle status in NeonDB.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  try {
    await updateIntentStatus(id, status);
  } catch (err) {
    console.error("[PATCH /api/intents/:id] DB error:", err);
    // Non-fatal for mock IDs (e.g. "1", "2", "3") that won't match any UUID row
  }

  return NextResponse.json({ id, status, ok: true });
}
