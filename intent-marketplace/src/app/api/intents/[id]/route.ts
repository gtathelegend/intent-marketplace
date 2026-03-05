import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/intents/[id]
 * Stub — acknowledges status updates without a real DB.
 * Swap the body for a pg UPDATE once a database is connected.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();
  // No-op until a real DB is wired up
  return NextResponse.json({ id, status, ok: true });
}
