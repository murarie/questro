import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  if (!feedback) {
    return (
      <section className="section-feedback">
        <div className="flex flex-col items-center gap-6 py-12">
          <h1 className="text-3xl font-semibold text-center">No Feedback Available</h1>
          <p className="text-light-400">Feedback has not been generated for this interview yet.</p>
          <div className="flex gap-4">
            <Link href="/">
              <Button className="btn-secondary">Back to Dashboard</Button>
            </Link>
            <Link href={`/interview/${id}`}>
              <Button className="btn-primary">Start Interview</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-feedback">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold text-center max-sm:text-3xl">
          Feedback on the Interview - <span className="capitalize text-primary-200">{interview.role}</span> Interview
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="flex flex-row justify-center gap-8 max-sm:flex-col max-sm:gap-4">
        {/* Overall Impression */}
        <div className="flex flex-row gap-3 items-center bg-dark-200 px-6 py-4 rounded-lg border border-light-800">
          <Image src="/star.svg" width={24} height={24} alt="star" />
          <div className="flex flex-col">
            <p className="text-sm text-light-400">Overall Impression</p>
            <p className="text-2xl font-bold text-primary-200">
              {feedback.totalScore}<span className="text-lg text-light-100">/100</span>
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-row gap-3 items-center bg-dark-200 px-6 py-4 rounded-lg border border-light-800">
          <Image src="/calendar.svg" width={24} height={24} alt="calendar" />
          <div className="flex flex-col">
            <p className="text-sm text-light-400">Completed On</p>
            <p className="text-lg font-semibold">
              {feedback.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="bg-dark-200 border border-primary-200 rounded-xl p-8 max-sm:p-6">
        <p className="text-lg leading-relaxed text-light-100">
          {feedback.finalAssessment}
        </p>
      </div>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold max-sm:text-2xl">Breakdown of the Interview:</h2>
        <div className="flex flex-col gap-6">
          {feedback.categoryScores?.map((category, index) => (
            <div 
              key={index} 
              className="bg-dark-200 border border-light-800 rounded-lg p-6 hover:border-primary-200 transition-colors"
            >
              <div className="flex flex-row justify-between items-start mb-3 max-sm:flex-col max-sm:gap-2">
                <h3 className="text-xl font-bold">
                  {index + 1}. {category.name}
                </h3>
                <span className="text-2xl font-bold text-primary-200">
                  {category.score}<span className="text-lg text-light-100">/100</span>
                </span>
              </div>
              <p className="text-light-300 leading-relaxed">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="flex flex-col gap-4 bg-success-100/10 border border-success-100 rounded-xl p-8 max-sm:p-6">
        <h3 className="text-2xl font-bold text-success-100 max-sm:text-xl">✨ Strengths</h3>
        <ul className="flex flex-col gap-3">
          {feedback.strengths?.map((strength, index) => (
            <li key={index} className="flex flex-row gap-3 items-start">
              <span className="text-success-100 text-xl mt-1">✓</span>
              <span className="text-light-100 leading-relaxed flex-1">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="flex flex-col gap-4 bg-primary-200/10 border border-primary-200 rounded-xl p-8 max-sm:p-6">
        <h3 className="text-2xl font-bold text-primary-200 max-sm:text-xl">📈 Areas for Improvement</h3>
        <ul className="flex flex-col gap-3">
          {feedback.areasForImprovement?.map((area, index) => (
            <li key={index} className="flex flex-row gap-3 items-start">
              <span className="text-primary-200 text-xl mt-1">→</span>
              <span className="text-light-100 leading-relaxed flex-1">{area}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              ← Back to Dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              🔄 Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
