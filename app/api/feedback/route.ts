import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/actions/general.action";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Feedback API received:", {
      interviewId: body.interviewId,
      userId: body.userId,
      transcriptLength: body.transcript?.length || 0,
      feedbackId: body.feedbackId,
    });

    if (!body.interviewId || !body.userId) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!body.transcript || body.transcript.length === 0) {
      console.error("❌ No transcript provided");
      return NextResponse.json(
        { success: false, error: "No transcript provided" },
        { status: 400 }
      );
    }

    const result = await createFeedback(body);
    
    console.log("📤 Feedback API result:", result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error in /api/feedback:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
