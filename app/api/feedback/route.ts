import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/actions/general.action";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createFeedback(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/feedback:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
