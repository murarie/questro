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
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. 
        Evaluate the candidate based on structured categories.
        Be detailed and objective — do not be lenient.
        Transcript:
        ${formattedTranscript}

        Score the candidate from 0 to 100 in:
        - Communication Skills
        - Technical Knowledge
        - Problem-Solving
        - Cultural & Role Fit
        - Confidence & Clarity
      `,
      system:
        "You are a professional interviewer analyzing a mock interview. Be thorough and honest.",
    });

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

    await feedbackRef.set(feedback);

    console.log("✅ Feedback saved successfully:", feedbackRef.id);
    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("❌ Error saving feedback:", error);
    return { success: false };
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
