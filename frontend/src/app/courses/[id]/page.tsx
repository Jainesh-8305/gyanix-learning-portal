/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import {
  Star,
  Users,
  Clock,
  CheckCircle,
  PlayCircle,
  Lock,
  Telescope,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Course } from "@/types";
import VideoPlayer from "@/components/courses/VideoPlayer";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [enrolling, setEnrolling] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({ 0: true });

  const { data, isLoading, mutate } = useSWR(`/courses/${params.id}`, fetcher);
  const course: Course | undefined = data?.data;
  const isEnrolled: boolean = data?.isEnrolled;

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to enroll");
      router.push(
        "/login?redirect=" + encodeURIComponent("/courses/" + params.id),
      );
      return;
    }
    if (user?.role === "instructor") {
      toast.error(
        "You are logged in as an instructor. Use a student account to enroll.",
      );
      return;
    }
    if (user?.role === "admin") {
      toast.error("Admins cannot enroll. Use a student account.");
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${params.id}`);
      toast.success("Enrolled! You can start learning now.");
      mutate();
      router.push(`/courses/${params.id}/learn`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-[#0c0f24]/85 backdrop-blur-2xl border-2 border-indigo-500/30 rounded-2xl px-8 py-6 shadow-2xl text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white font-medium text-sm">
            Loading course details…
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-[#0c0f24]/85 backdrop-blur-2xl border-2 border-indigo-500/30 rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <Telescope size={36} className="text-teal-400 mx-auto mb-4" />
          <p className="text-white font-bold text-lg mb-2">Course not found</p>
          <p className="text-indigo-200/70 text-sm mb-4">
            The charted coordinates could not be located in our academy
            database.
          </p>
          <Link
            href="/courses"
            className="inline-block bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg hover:brightness-110 transition text-sm"
          >
            Browse other courses
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons =
    course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) || 0;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Preview Video Modal */}
      {previewLesson && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewLesson(null);
          }}
        >
          <div className="w-full max-w-3xl bg-[#0f1120] rounded-2xl overflow-hidden border border-indigo-500/20">
            <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-500/15">
              <p className="text-sm font-medium text-white">
                {previewLesson.title}
              </p>
              <button
                onClick={() => setPreviewLesson(null)}
                className="text-indigo-300/50 hover:text-white transition text-xl"
              >
                ✕
              </button>
            </div>
            <VideoPlayer
              videoUrl={previewLesson.videoUrl}
              lessonId={previewLesson._id}
              onComplete={() => {}}
              title={previewLesson.title}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-start">
          {/* Mission Briefing Card (Left Column) */}
          <div className="lg:col-span-2 bg-[#0c0f24]/85 backdrop-blur-2xl border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/40 text-teal-300 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-teal-500/15 mb-4">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>{course.category?.replace("-", " ")}</span>
            </div>

            {/* High-Contrast Hero Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2] mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              {course.title}
            </h1>

            {/* Subtitle / Description HUD Box */}
            <div className="bg-[#05060f]/80 backdrop-blur-md border border-indigo-400/25 rounded-2xl p-4 sm:p-5 mb-6">
              <p className="text-sm sm:text-base text-indigo-100 font-medium leading-relaxed tracking-wide">
                {course.shortDescription || course.description}
              </p>
            </div>

            {/* Stats & Meta Pills */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-indigo-100 flex-wrap mb-5">
              <span className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/30 text-amber-300 px-3 py-1.5 rounded-xl shadow-sm">
                <Star size={15} className="text-amber-400 fill-amber-400" />
                <span>
                  {course.rating?.toFixed(1) || "0.0"} (
                  {course.totalRatings || 0} ratings)
                </span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#05060f]/70 border border-indigo-500/30 text-indigo-200 px-3 py-1.5 rounded-xl">
                <Users size={15} className="text-teal-400" />
                <span>{course.totalStudents || 0} students</span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#05060f]/70 border border-indigo-500/30 text-indigo-200 px-3 py-1.5 rounded-xl">
                <Clock size={15} className="text-teal-400" />
                <span>{totalLessons} lessons</span>
              </span>
            </div>

            {/* Instructor Attribution */}
            <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/20 text-xs sm:text-sm text-indigo-200/80">
              <span>Instruction by:</span>
              <span className="text-teal-300 font-bold bg-teal-400/10 px-3 py-1 rounded-lg border border-teal-400/30 shadow-sm">
                {typeof course.instructor === "object"
                  ? course.instructor.name
                  : "Master Instructor"}
              </span>
            </div>
          </div>

          {/* Premium Purchase Card (Right Column) */}
          <div className="bg-[#0c0f24]/90 backdrop-blur-2xl border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
            {course.thumbnail && (
              <div className="aspect-video rounded-2xl mb-5 overflow-hidden border-2 border-indigo-500/30 shadow-xl bg-black/40">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}

            <div className="mb-6 rounded-xl border border-indigo-500/25 p-4">
              <p className="text-lg font-semibold text-white">Free course</p>
              <p className="text-sm text-indigo-200/70 mt-1">
                Enroll to save your progress and access course assessments.
              </p>
            </div>

            {/* Action Button */}
            {isEnrolled ? (
              <Link
                href={`/courses/${course._id}/learn`}
                className="block text-center w-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 hover:brightness-110 active:scale-95 text-white font-extrabold text-base py-4 rounded-xl transition shadow-xl shadow-teal-500/30"
              >
                Continue learning →
              </Link>
            ) : user?.role === "instructor" || user?.role === "admin" ? (
              <div className="w-full bg-[#05060f]/80 border border-indigo-400/30 text-indigo-200/60 text-sm text-center py-4 rounded-xl font-medium">
                Switch to a student account to enroll
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-500 hover:brightness-110 active:scale-95 text-white font-extrabold text-base py-4 rounded-xl transition shadow-xl shadow-indigo-500/35 cursor-pointer disabled:opacity-50"
              >
                {enrolling ? "Enrolling..." : "Enroll for free"}
              </button>
            )}

            {/* Course Inclusions List */}
            <div className="mt-6 pt-5 border-t border-indigo-500/20">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3">
                This mission includes:
              </p>
              <ul className="space-y-3 text-sm text-indigo-100 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle size={17} className="text-teal-400 shrink-0" />
                  <span>Access while the course is published</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle size={17} className="text-teal-400 shrink-0" />
                  <span>Certificate of completion</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle size={17} className="text-teal-400 shrink-0" />
                  <span>{totalLessons} video lessons & modules</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Body: Curriculum & Syllabus */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          {course.learningOutcomes?.length > 0 && (
            <div className="bg-[#0c0f24]/85 backdrop-blur-2xl border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-5 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                <span>What you&apos;ll learn</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {course.learningOutcomes.map((outcome, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-indigo-100 font-medium bg-[#05060f]/60 border border-indigo-500/20 rounded-xl p-3"
                  >
                    <CheckCircle
                      size={17}
                      className="text-teal-400 shrink-0 mt-0.5"
                    />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          <div className="bg-[#0c0f24]/85 backdrop-blur-2xl border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-5 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span>Course curriculum</span>
            </h2>
            {course.sections?.length ? (
              <div className="space-y-3.5">
                {course.sections.map((section, sIndex) => (
                  <div
                    key={section._id || sIndex}
                    className="border-2 border-indigo-500/20 rounded-2xl overflow-hidden bg-[#05060f]/60"
                  >
                    {/* Section header — clickable */}
                    <button
                      onClick={() => toggleSection(sIndex)}
                      className="w-full flex items-center justify-between bg-white/[0.04] px-5 py-4 hover:bg-white/[0.08] transition text-left cursor-pointer"
                    >
                      <p className="text-sm sm:text-base font-bold text-white">
                        {section.title}
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-teal-300 bg-teal-400/10 border border-teal-400/30 px-2.5 py-1 rounded-lg">
                          {section.lessons.length} lessons
                        </span>
                        {expandedSections[sIndex] ? (
                          <ChevronUp size={16} className="text-indigo-300" />
                        ) : (
                          <ChevronDown size={16} className="text-indigo-300" />
                        )}
                      </div>
                    </button>

                    {/* Lessons */}
                    {expandedSections[sIndex] && (
                      <div className="divide-y divide-indigo-500/15">
                        {section.lessons.map((lesson, lIndex) => {
                          const canPlay = lesson.isFree || isEnrolled;
                          return (
                            <div
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (
                                  event.target === event.currentTarget &&
                                  (event.key === "Enter" || event.key === " ")
                                ) {
                                  event.preventDefault();
                                  event.currentTarget.click();
                                }
                              }}
                              key={lesson._id || lIndex}
                              onClick={() =>
                                canPlay && lesson.videoUrl
                                  ? setPreviewLesson(lesson)
                                  : null
                              }
                              className={`px-5 py-3.5 flex items-center gap-3.5 text-sm transition ${
                                canPlay && lesson.videoUrl
                                  ? "cursor-pointer hover:bg-white/[0.06]"
                                  : "cursor-default"
                              }`}
                            >
                              {canPlay ? (
                                <PlayCircle
                                  size={18}
                                  className="text-teal-400 shrink-0"
                                />
                              ) : (
                                <Lock
                                  size={18}
                                  className="text-indigo-400/40 shrink-0"
                                />
                              )}
                              <span
                                className={`flex-1 font-medium ${canPlay ? "text-white" : "text-indigo-200/50"}`}
                              >
                                {lesson.title}
                              </span>
                              {lesson.isFree &&
                                !isEnrolled &&
                                lesson.videoUrl && (
                                  <span className="text-xs text-teal-300 font-bold bg-teal-400/15 border border-teal-400/40 px-2.5 py-1 rounded-full shadow-sm">
                                    Free preview
                                  </span>
                                )}
                              {!lesson.videoUrl && (
                                <span className="text-xs text-indigo-300/40">
                                  {lesson.hasVideo
                                    ? "Enroll to watch"
                                    : "No video yet"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-indigo-200/60">
                Curriculum coming soon.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#0c0f24]/85 backdrop-blur-2xl border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
              Course overview
            </h2>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-normal whitespace-pre-line">
              {course.description}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {(course as any).requirements?.length > 0 && (
            <div className="bg-[#0c0f24]/85 backdrop-blur-2xl border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h3 className="font-bold text-white mb-4 text-base">
                Requirements
              </h3>
              <ul className="space-y-2.5 text-sm text-indigo-100/80 list-disc list-inside">
                {(course as any).requirements.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
