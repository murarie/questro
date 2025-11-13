"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

/* -----------------------------------------------
 * 🔹 CREATE FEEDBACK
 * --------------------------------------------- */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    console.log("🎯 Creating feedback with params:", {
      interviewId,
      userId,
      transcriptLength: transcript?.length || 0,
      feedbackId,
    });

    if (!transcript || transcript.length === 0) {
      console.error("❌ No transcript provided to createFeedback");
      return { success: false, error: "No transcript provided" };
    }

    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    console.log("📝 Formatted transcript:", formattedTranscript.substring(0, 200) + "...");
    console.log("🤖 Calling AI to generate feedback...");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: feedbackSchema,
      prompt: `You are an AI interviewer analyzing a mock interview. 
Evaluate the candidate based on the following transcript and provide structured feedback.

TRANSCRIPT:
${formattedTranscript}

REQUIREMENTS:
1. Provide an overall totalScore from 0-100
2. Score the candidate in EXACTLY these 5 categories (0-100 each):
   - Communication Skills: Clarity, articulation, and listening skills
   - Technical Knowledge: Depth and accuracy of technical responses
   - Problem Solving: Analytical thinking and approach to challenges
   - Cultural Fit: Alignment with professional values and teamwork
   - Confidence and Clarity: Self-assurance and clear expression
3. List 3-5 key strengths
4. List 3-5 areas for improvement
5. Provide a comprehensive final assessment paragraph

Be objective and constructive in your evaluation.`,
      system:
        "You are a professional technical interviewer providing detailed, honest feedback on mock interviews.",
    });

    console.log("✨ AI generated feedback with total score:", object.totalScore);

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    console.log("💾 Saving feedback to Firestore with ID:", feedbackRef.id);
    await feedbackRef.set(feedback);

    console.log("✅ Feedback saved successfully to Firestore!");
    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("❌ Error saving feedback:", error);
    return { success: false, error: String(error) };
  }
}

/* -----------------------------------------------
 * 🔹 GET INTERVIEW BY ID
 * --------------------------------------------- */
export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    console.log("🧠 Fetching interview by ID:", id);

    if (!id) {
      console.error("❌ Missing interview ID");
      return null;
    }

    const docRef = db.collection("interviews").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn("⚠️ No interview found with ID:", id);
      return null;
    }

    const interviewData = { id: docSnap.id, ...docSnap.data() };
    console.log("✅ Interview fetched successfully:", interviewData);
    return interviewData as Interview;
  } catch (error) {
    console.error("❌ Error fetching interview:", error);
    return null;
  }
}

/* -----------------------------------------------
 * 🔹 GET FEEDBACK BY INTERVIEW ID
 * --------------------------------------------- */
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  try {
    console.log("📘 Fetching feedback for:", { interviewId, userId });

    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      console.warn("⚠️ No feedback found for this interview.");
      return null;
    }

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    return null;
  }
}

/* -----------------------------------------------
 * 🔹 GET LATEST INTERVIEWS (for Home Page)
 * --------------------------------------------- */
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  try {
    const interviews = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .limit(limit)
      .get();

    if (interviews.empty) {
      console.warn("⚠️ No latest interviews found");
      return [];
    }

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("❌ Error fetching latest interviews:", error);
    return null;
  }
}

/* -----------------------------------------------
 * 🔹 GET USER'S OWN INTERVIEWS
 * --------------------------------------------- */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    console.log("📗 Fetching interviews for user:", userId);

    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    if (interviews.empty) {
      console.warn("⚠️ No interviews found for user:", userId);
      return [];
    }

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("❌ Error fetching user interviews:", error);
    return null;
  }
}
