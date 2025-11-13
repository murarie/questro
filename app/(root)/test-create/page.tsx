import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

async function createTestInterview(formData: FormData) {
  "use server";
  
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Not authenticated");
  }

  const interviewData = {
    userId: user.id,
    role: "Test Developer",
    type: "technical",
    level: "Senior",
    amount: 5,
    techstack: ["JavaScript", "React", "Next.js"],
    finalized: true,
    coverImage: "/covers/spotify.png",
    createdAt: new Date().toISOString(),
    questions: [
      "What is your experience with React?",
      "How do you handle state management?",
      "Explain the concept of server-side rendering.",
      "What are React hooks?",
      "How do you optimize React performance?"
    ],
  };

  const docRef = await db.collection("interviews").add(interviewData);
  console.log("✅ Test Interview created with ID:", docRef.id);
  
  redirect(`/interview/${docRef.id}`);
}

const TestCreatePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl mx-auto">
      <div className="border border-primary-200 p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Create Test Interview</h1>
        
        <div className="bg-dark-200 p-4 rounded mb-6">
          <p className="mb-2"><strong>Current User:</strong></p>
          <p className="text-primary-200">{user.name}</p>
          <p className="text-sm text-light-400">{user.email}</p>
          <p className="text-xs text-light-600 mt-2">ID: {user.id}</p>
        </div>

        <p className="mb-6 text-light-100">
          Click the button below to create a test interview directly in your account. 
          This will create an interview with YOUR user ID so you can test the complete flow.
        </p>

        <form action={createTestInterview}>
          <Button type="submit" className="btn-primary w-full">
            Create Test Interview & Take It
          </Button>
        </form>
      </div>

      <div className="border border-destructive-100 p-6 rounded-lg bg-destructive-100/10">
        <h2 className="text-xl font-bold mb-3 text-destructive-100">⚠️ Issue Identified</h2>
        <p className="mb-3">
          All existing interviews in your database belong to different user IDs:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-light-100 mb-3">
          <li><code>N7ouxDfdBtYUEF3dViVZNJECOeH2</code></li>
          <li><code>testUser123</code></li>
          <li><code>RF1Pp3UO8ufKMvUFhmPP1clMfBO2</code></li>
        </ul>
        <p>
          Your current user ID is: <code className="text-primary-200">{user.id}</code>
        </p>
        <p className="mt-3 text-sm">
          The VAPI workflow might not be correctly passing your user ID when creating interviews.
          Use this test page to create an interview manually with the correct user ID.
        </p>
      </div>
    </div>
  );
};

export default TestCreatePage;
