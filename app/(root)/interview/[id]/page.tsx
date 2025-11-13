import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const InterviewDetails = async ({ params }: RouteParams) => {
  // ✅ FIXED: await params — params is a Promise in Next.js 15+
  const { id } = await params;

  console.log("📘 Interview ID received:", id);

  // ✅ Get current user
  const user = await getCurrentUser();
  if (!user) {
    console.error("❌ No user found — redirecting");
    redirect("/sign-in");
  }

  // ✅ Fetch interview data from Firestore
  const interview = await getInterviewById(id);
  console.log("🧠 Firestore returned interview:", interview);

  if (!interview) {
    console.error("⚠️ No interview found with this ID, redirecting to home");
    redirect("/");
  }

  // ✅ Fetch feedback if available
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  // ✅ Normalize techstack to always be an array
  const techStackArray: string[] = Array.isArray(interview.techstack)
    ? interview.techstack
    : typeof interview.techstack === "string"
    ? (interview.techstack as string).split(",").map((t: string) => t.trim())
    : [];

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-10"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          <DisplayTechIcons techStack={techStackArray} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">
          {interview.type || "technical"}
        </p>
      </div>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions || []}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;
