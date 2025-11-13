import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

async function generateMockFeedback(formData: FormData) {
  "use server";
  
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Not authenticated");
  }

  const interviewId = formData.get("interviewId") as string;

  try {
    console.log("🎯 Generating MOCK feedback (no AI call)");
    
    // Create mock feedback data without calling AI
    const mockFeedback = {
      interviewId,
      userId: user.id,
      totalScore: Math.floor(Math.random() * 20) + 75, // Random score between 75-95
      categoryScores: [
        {
          name: "Communication Skills",
          score: Math.floor(Math.random() * 15) + 80,
          comment: "Demonstrates clear articulation and effective listening. Responses are well-structured and easy to follow."
        },
        {
          name: "Technical Knowledge",
          score: Math.floor(Math.random() * 20) + 75,
          comment: "Shows solid understanding of core concepts. Provides relevant examples and demonstrates practical experience."
        },
        {
          name: "Problem Solving",
          score: Math.floor(Math.random() * 15) + 80,
          comment: "Exhibits strong analytical thinking. Approaches challenges methodically and considers multiple solutions."
        },
        {
          name: "Cultural Fit",
          score: Math.floor(Math.random() * 10) + 85,
          comment: "Aligns well with professional values. Demonstrates teamwork mindset and adaptability."
        },
        {
          name: "Confidence and Clarity",
          score: Math.floor(Math.random() * 15) + 80,
          comment: "Expresses ideas with confidence. Maintains composure and provides clear, concise answers."
        }
      ],
      strengths: [
        "Strong technical foundation with practical experience",
        "Excellent problem-solving approach and analytical thinking",
        "Clear communication and ability to explain complex concepts",
        "Demonstrates continuous learning and adaptability",
        "Good understanding of best practices and modern development patterns"
      ],
      areasForImprovement: [
        "Could provide more specific metrics when discussing achievements",
        "Consider elaborating on team collaboration experiences",
        "Opportunity to discuss more edge cases in technical solutions",
        "Could strengthen examples of handling challenging situations"
      ],
      finalAssessment: "The candidate demonstrates strong technical competency and effective communication skills. Their responses show practical experience and a solid understanding of fundamental concepts. They approach problems methodically and provide well-reasoned solutions. With continued focus on providing specific examples and metrics, they would be an excellent addition to any team. Overall performance indicates readiness for the role with room for growth in areas of leadership and advanced problem-solving scenarios.",
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    const feedbackRef = db.collection("feedback").doc();
    await feedbackRef.set(mockFeedback);

    console.log("✅ Mock feedback saved successfully:", feedbackRef.id);
    
    redirect(`/interview/${interviewId}/feedback`);
  } catch (error) {
    console.error("Mock feedback generation failed:", error);
    throw error;
  }
}

const MockFeedbackPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get the user's interviews
  const interviewsSnapshot = await db
    .collection("interviews")
    .where("userId", "==", user.id)
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();

  const interviews = interviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      <div className="border border-success-100 p-6 rounded-lg bg-success-100/10">
        <h1 className="text-3xl font-bold mb-4 text-success-100">⚡ Mock Feedback Generator</h1>
        
        <div className="bg-dark-200 p-4 rounded mb-6">
          <p className="mb-2"><strong>Current User:</strong></p>
          <p className="text-primary-200">{user.name}</p>
          <p className="text-sm text-light-400">{user.email}</p>
          <p className="text-xs text-light-600 mt-2">ID: {user.id}</p>
        </div>

        <div className="bg-primary-200/10 border border-primary-200 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-primary-200 mb-2">💡 Why Mock Feedback?</h3>
          <p className="text-sm text-light-100">
            Your Google Gemini API has hit the free tier quota limit. This page generates 
            realistic mock feedback <strong>without calling the AI API</strong>, so you can test 
            the feedback display and flow instantly!
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">📋 How This Works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-light-100">
            <li>Select an interview from your list below</li>
            <li>Click "⚡ Generate Mock Feedback"</li>
            <li>System creates realistic feedback data (no API call)</li>
            <li>Feedback includes scores, strengths, and improvement areas</li>
            <li>You'll be redirected to view the feedback immediately</li>
          </ol>
        </div>
      </div>

      {interviews.length > 0 ? (
        <div className="border border-primary-200 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Your Interviews ({interviews.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map((interview: any) => (
              <div key={interview.id} className="border border-light-800 p-4 rounded-lg bg-dark-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{interview.role}</h3>
                    <p className="text-xs text-light-400">Type: {interview.type}</p>
                    <p className="text-xs text-light-400">Level: {interview.level}</p>
                  </div>
                  <span className="bg-primary-200 text-dark-100 px-2 py-1 rounded text-xs font-semibold">
                    {interview.amount || 5}Q
                  </span>
                </div>
                
                <form action={generateMockFeedback}>
                  <input type="hidden" name="interviewId" value={interview.id} />
                  <Button type="submit" className="btn-primary w-full text-sm">
                    ⚡ Generate Mock Feedback
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-destructive-100 p-6 rounded-lg bg-destructive-100/10">
          <h2 className="text-xl font-bold mb-3 text-destructive-100">No Interviews Found</h2>
          <p className="mb-4">You don't have any interviews yet. Create one first!</p>
          <Link href="/test-create">
            <Button className="btn-primary">Create Test Interview</Button>
          </Link>
        </div>
      )}

      <div className="border border-light-800 p-6 rounded-lg bg-dark-300">
        <h2 className="text-xl font-bold mb-3">📊 Mock Feedback Includes:</h2>
        <ul className="space-y-2 text-sm text-light-100">
          <li>✅ Overall score (75-95 range)</li>
          <li>✅ 5 category scores with detailed comments</li>
          <li>✅ 5 key strengths</li>
          <li>✅ 4 areas for improvement</li>
          <li>✅ Comprehensive final assessment</li>
        </ul>
        <p className="mt-4 text-xs text-light-400 italic">
          Note: Scores are randomly generated for variety. Each generation creates unique feedback.
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/" className="flex-1">
          <Button className="btn-secondary w-full">← Back to Dashboard</Button>
        </Link>
        <Link href="/debug" className="flex-1">
          <Button className="btn-secondary w-full">🔍 View Debug Info</Button>
        </Link>
      </div>

      <div className="bg-destructive-100/10 border border-destructive-100 p-4 rounded-lg">
        <h3 className="font-bold text-destructive-100 mb-2">⚠️ API Quota Issue</h3>
        <p className="text-sm text-light-100 mb-2">
          Your Google Gemini API free tier quota has been exceeded. To use real AI-generated feedback:
        </p>
        <ul className="text-xs text-light-400 list-disc list-inside space-y-1">
          <li>Wait for the quota to reset (usually 24 hours)</li>
          <li>Upgrade to a paid plan at <a href="https://ai.google.dev/pricing" target="_blank" className="text-primary-200 underline">ai.google.dev/pricing</a></li>
          <li>Use a different API key</li>
        </ul>
      </div>
    </div>
  );
};

export default MockFeedbackPage;
