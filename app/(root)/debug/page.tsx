import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";

const DebugPage = async () => {
  const user = await getCurrentUser();

  // Get ALL interviews (no user filter)
  const allInterviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();

  const interviews = allInterviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Get ALL feedback
  const allFeedback = await db
    .collection("feedback")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();

  const feedbacks = allFeedback.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="border border-primary-200 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Current User Info</h2>
        <pre className="bg-dark-200 p-4 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="border border-primary-200 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">All Interviews (Last 10)</h2>
        <div className="bg-dark-200 p-4 rounded overflow-auto max-h-96">
          {interviews.map((interview: any) => (
            <div key={interview.id} className="mb-4 pb-4 border-b border-light-800">
              <p className="text-primary-200">ID: {interview.id}</p>
              <p>Role: {interview.role}</p>
              <p>User ID: {interview.userId}</p>
              <p className={interview.userId === user?.id ? "text-success-100" : "text-destructive-100"}>
                {interview.userId === user?.id ? "✅ YOUR INTERVIEW" : "❌ Different User"}
              </p>
              <p className="text-xs text-light-400">Created: {interview.createdAt}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-primary-200 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">All Feedback (Last 10)</h2>
        <div className="bg-dark-200 p-4 rounded overflow-auto max-h-96">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback: any) => (
              <div key={feedback.id} className="mb-4 pb-4 border-b border-light-800">
                <p className="text-primary-200">ID: {feedback.id}</p>
                <p>Interview ID: {feedback.interviewId}</p>
                <p>User ID: {feedback.userId}</p>
                <p>Score: {feedback.totalScore}/100</p>
                <p className={feedback.userId === user?.id ? "text-success-100" : "text-destructive-100"}>
                  {feedback.userId === user?.id ? "✅ YOUR FEEDBACK" : "❌ Different User"}
                </p>
              </div>
            ))
          ) : (
            <p>No feedback found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
