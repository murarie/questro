import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📩 Incoming body:", body);

    const { role, type, level, amount, techstack, userid } = body;

    // Validate required fields
    if (!userid) {
      console.error("❌ Missing userId in request body");
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    if (!role || !type || !level) {
      console.error("❌ Missing one or more required interview fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare interview object
    const interviewData = {
      userId: userid,
      role,
      type,
      level,
      amount: amount || 5,
      techstack: techstack || "",
      finalized: true,
      coverImage: "/covers/spotify.png",
      createdAt: new Date().toISOString(),
      questions: [
        "Describe a time you had to debug a complex performance issue in a Next.js app.",
        "Explain your approach to state management in large React apps."
      ],
    };

    // Create interview in Firestore
    const docRef = await db.collection("interviews").add(interviewData);
    console.log("✅ Interview created with ID:", docRef.id);

    // Return interview ID so frontend can redirect
    return NextResponse.json({
      success: true,
      interviewId: docRef.id,
    });
  } catch (error) {
    console.error("❌ Error creating interview:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate interview" },
      { status: 500 }
    );
  }
}
