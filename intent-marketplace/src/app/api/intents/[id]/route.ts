import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";

/**
 * PATCH: Update intent status (approved/rejected)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await db.findOne(
      `UPDATE intents SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (!result) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Update Intent Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
