import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

async function testFeedbackGeneration(formData: FormData) {
  "use server";
  
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Sample mock interview transcript
  const mockTranscript = [
    {
      role: "assistant",
      content: "Hello! Let's begin the interview. Can you tell me about your experience with React?"
    },
    {
      role: "user",
      content: "I have been working with React for about 3 years. I've built several production applications using React hooks, context API, and Redux for state management. I'm comfortable with component lifecycle, performance optimization, and modern React patterns."
    },
    {
      role: "assistant",
      content: "That's great! Can you explain how you would optimize a React application that's experiencing performance issues?"
    },
    {
      role: "user",
      content: "I would start by using React DevTools Profiler to identify slow components. Then I'd apply techniques like React.memo for preventing unnecessary re-renders, useMemo and useCallback for expensive computations, code splitting with React.lazy and Suspense, and virtualizing long lists. I'd also check for prop drilling issues and consider using context or state management solutions appropriately."
    },
    {
      role: "assistant",
      content: "Excellent answer! How do you handle state management in large-scale applications?"
    },
    {
      role: "user",
      content: "For large applications, I prefer using Redux Toolkit for global state because it reduces boilerplate and provides great DevTools. For server state, I use React Query or SWR which handle caching, revalidation, and synchronization automatically. For local component state, I stick with useState and useReducer. I also use Zustand for simpler global state needs."
    },
    {
      role: "assistant",
      content: "Great! Tell me about a challenging bug you've encountered and how you solved it."
    },
    {
      role: "user",
      content: "I once had a memory leak in a React app where event listeners weren't being cleaned up. The app would slow down over time. I used Chrome DevTools memory profiler to identify detached DOM nodes. The issue was in a useEffect hook where I added an event listener but forgot to return a cleanup function. After adding proper cleanup, the memory leak was resolved."
    },
    {
      role: "assistant",
      content: "Perfect! Last question - what are your thoughts on TypeScript with React?"
    },
    {
      role: "user",
      content: "I'm a strong advocate for TypeScript in React projects. It catches errors at compile time, provides better IDE support with autocomplete, makes refactoring safer, and serves as living documentation. The initial setup cost is worth it for medium to large projects. I use proper typing for props, state, and API responses."
    }
  ];

  try {
    // Call the feedback API directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewId: formData.get("interviewId"),
        userId: user.id,
        transcript: mockTranscript,
      }),
    });

    const result = await response.json();
    
    if (result.success && result.feedbackId) {
      redirect(`/interview/${formData.get("interviewId")}/feedback`);
    } else {
      throw new Error(result.error || "Failed to generate feedback");
    }
  } catch (error) {
    console.error("Test feedback generation failed:", error);
    throw error;
  }
}

const TestFeedbackPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get the user's interviews
  const interviewsSnapshot = await db
    .collection("interviews")
    .where("userId", "==", user.id)
    .orderBy("createdAt", "desc")
    .limit(5)
    .get();

  const interviews = interviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      <div className="border border-success-100 p-6 rounded-lg bg-success-100/10">
        <h1 className="text-3xl font-bold mb-4 text-success-100">🧪 Test Feedback System</h1>
        
        <div className="bg-dark-200 p-4 rounded mb-6">
          <p className="mb-2"><strong>Current User:</strong></p>
          <p className="text-primary-200">{user.name}</p>
          <p className="text-sm text-light-400">{user.email}</p>
          <p className="text-xs text-light-600 mt-2">ID: {user.id}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">📋 How This Works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-light-100">
            <li>Select an interview from your list below</li>
            <li>Click "Generate Test Feedback"</li>
            <li>The system will use a mock conversation (sample interview answers)</li>
            <li>AI will analyze the mock transcript and generate real feedback</li>
            <li>You'll be redirected to view the feedback</li>
          </ol>
        </div>
      </div>

      {interviews.length > 0 ? (
        <div className="border border-primary-200 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Your Interviews</h2>
          <div className="space-y-4">
            {interviews.map((interview: any) => (
              <div key={interview.id} className="border border-light-800 p-4 rounded-lg bg-dark-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold capitalize">{interview.role} Interview</h3>
                    <p className="text-sm text-light-400">Type: {interview.type}</p>
                    <p className="text-sm text-light-400">Level: {interview.level}</p>
                    <p className="text-xs text-light-600 mt-1">ID: {interview.id}</p>
                  </div>
                  <span className="bg-primary-200 text-dark-100 px-3 py-1 rounded text-sm font-semibold">
                    {interview.amount || 5} Questions
                  </span>
                </div>
                
                <form action={testFeedbackGeneration}>
                  <input type="hidden" name="interviewId" value={interview.id} />
                  <Button type="submit" className="btn-primary w-full">
                    🧪 Generate Test Feedback
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
        <h2 className="text-xl font-bold mb-3">💡 Sample Mock Transcript</h2>
        <p className="text-sm text-light-400 mb-3">This is the conversation that will be analyzed:</p>
        <div className="bg-dark-200 p-4 rounded max-h-64 overflow-y-auto space-y-2 text-xs">
          <div className="text-primary-200">
            <strong>AI:</strong> Hello! Let's begin the interview. Can you tell me about your experience with React?
          </div>
          <div className="text-success-100">
            <strong>You:</strong> I have been working with React for about 3 years...
          </div>
          <div className="text-primary-200">
            <strong>AI:</strong> That's great! Can you explain how you would optimize a React application...
          </div>
          <div className="text-success-100">
            <strong>You:</strong> I would start by using React DevTools Profiler...
          </div>
          <p className="text-light-600 italic">... (5 more Q&A exchanges)</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/" className="flex-1">
          <Button className="btn-secondary w-full">← Back to Dashboard</Button>
        </Link>
        <Link href="/debug" className="flex-1">
          <Button className="btn-secondary w-full">🔍 View Debug Info</Button>
        </Link>
      </div>
    </div>
  );
};

export default TestFeedbackPage;
