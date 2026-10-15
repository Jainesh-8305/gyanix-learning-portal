/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import useSWR from "swr";
import {
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileCode,
  Send,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface AIAssignmentStudioModalProps {
  onClose: () => void;
  courses: any[];
}

export default function AIAssignmentStudioModal({
  onClose,
  courses,
}: AIAssignmentStudioModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose, true);

  const [activeTab, setActiveTab] = useState<
    "create" | "gradebook" | "sandbox"
  >("create");

  // ── Tab 1: AI Assignment Creator State ──
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?._id || "",
  );
  const [topic, setTopic] = useState("");
  const [formatType, setFormatType] = useState<
    "code" | "architecture" | "essay"
  >("code");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Generated Assignment Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rubric, setRubric] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [maxScore, setMaxScore] = useState(100);

  // ── Tab 2: Gradebook State ──
  const {
    data: assignmentsRes,
    mutate: mutateAssignments,
    isLoading: loadingAssignments,
  } = useSWR("/assignments/instructor/my", (url) =>
    api.get(url).then((r) => r.data),
  );
  const assignments = useMemo(
    () => assignmentsRes?.data || [],
    [assignmentsRes],
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [inspectSubmission, setInspectSubmission] = useState<any>(null);

  // Default to first assignment if available
  useEffect(() => {
    if (assignments.length > 0 && !selectedAssignmentId) {
      setSelectedAssignmentId(assignments[0]._id);
    }
  }, [assignments, selectedAssignmentId]);

  // ── Tab 3: Sandbox Quick Grader State ──
  const [sandboxQuestion, setSandboxQuestion] = useState("");
  const [sandboxRubric, setSandboxRubric] = useState("");
  const [sandboxAnswerKey, setSandboxAnswerKey] = useState("");
  const [sandboxAnswer, setSandboxAnswer] = useState("");
  const [sandboxEvaluating, setSandboxEvaluating] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // ── Action: AI Generate Assignment + Master Answer Key ──
  const handleAIGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter an assignment topic or concept");
      return;
    }
    const currentCourse = courses.find((c) => c._id === selectedCourseId);
    setIsGenerating(true);

    try {
      const res = await api.post("/assignments/ai-generate", {
        topic,
        courseTitle: currentCourse?.title || "Technical Course",
        type: formatType,
        difficulty,
      });

      const gen = res.data.data;
      setTitle(gen.title);
      setDescription(gen.description);
      setRubric(gen.rubric);
      setAnswerKey(gen.answerKey);
      setMaxScore(gen.maxScore || 100);
      toast.success(
        gen.mode === "offline"
          ? "Offline editable template created. Review every field before publishing."
          : "Assignment draft generated. Review it before publishing.",
      );
    } catch {
      toast.error("Failed to generate assignment with AI");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Action: Deploy to Classroom Batch ──
  const handleDeployAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error("Please select a course for this assignment");
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsDeploying(true);
    try {
      await api.post("/assignments", {
        title,
        description,
        courseId: selectedCourseId,
        maxScore,
        rubric,
        answerKey,
        enableAiGrading: true,
      });

      toast.success(
        "🚀 Assignment deployed! Students can now submit solutions.",
      );
      mutateAssignments();
      setActiveTab("gradebook");
      setTitle("");
      setDescription("");
      setRubric("");
      setAnswerKey("");
      setTopic("");
    } catch {
      toast.error("Failed to deploy assignment");
    } finally {
      setIsDeploying(false);
    }
  };

  // ── Action: Sandbox Manual Evaluation ──
  const handleSandboxEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxQuestion.trim() || !sandboxAnswer.trim()) {
      toast.error("Please provide both question and student answer");
      return;
    }

    setSandboxEvaluating(true);
    setSandboxResult(null);

    try {
      const res = await api.post("/ai/grade-rubric", {
        question: sandboxQuestion,
        rubric: sandboxRubric || "Evaluate correctness, logic, and clarity",
        answerKey: sandboxAnswerKey,
        studentAnswer: sandboxAnswer,
        maxPoints: 100,
      });
      setSandboxResult(res.data.data);
      toast.success("🎯 AI Evaluation completed against Answer Key!");
    } catch {
      toast.error("Evaluation failed");
    } finally {
      setSandboxEvaluating(false);
    }
  };

  const activeAssignment = assignments.find(
    (a: any) => a._id === selectedAssignmentId,
  );

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="glass-card max-w-5xl w-full rounded-3xl p-5 sm:p-8 border border-indigo-500/30 bg-[#0a0d20] space-y-6 max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-indigo-500/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-indigo-600/30 text-teal-300 flex items-center justify-center border border-teal-500/40 shadow-lg">
              <Award className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  AI Assignment Studio & Auto-Gradebook
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Optional OpenAI grading
                </span>
              </div>
              <p className="text-xs text-indigo-200/60 mt-0.5">
                Draft an assignment with OpenAI or an offline template. Review
                the reference key. Automatic grading requires a working OpenAI
                connection; unavailable grades stay pending for instructor
                review.
              </p>
            </div>
          </div>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="text-indigo-300/60 hover:text-white p-1 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/4 border border-indigo-500/20">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "create"
                ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg"
                : "text-indigo-300/70 hover:text-white hover:bg-white/4"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Create & Deploy with AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gradebook")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "gradebook"
                ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg"
                : "text-indigo-300/70 hover:text-white hover:bg-white/4"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Auto-Gradebook & Submissions ({assignments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sandbox")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg"
                : "text-indigo-300/70 hover:text-white hover:bg-white/4"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. Quick Sandbox Tester</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 1: AI ASSIGNMENT CREATOR WITH MASTER ANSWER KEY          */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "create" && (
            <div className="space-y-5">
              {/* Generator Prompt Bar */}
              <div className="p-4 sm:p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/25 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>
                      Instant AI Generator (Prompt → Assignment + Answer Key)
                    </span>
                  </span>
                  <span className="text-[11px] text-indigo-300/60">
                    Instructor review required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="field-dashboardAIAssignmentStudioModaltsx-1"
                      className="block text-[11px] font-semibold text-indigo-200/80 mb-1"
                    >
                      Target Course / Batch
                    </label>
                    <select
                      id="field-dashboardAIAssignmentStudioModaltsx-1"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    >
                      {courses.map((c) => (
                        <option
                          key={c._id}
                          value={c._id}
                          className="bg-[#0f1120]"
                        >
                          {c.title} ({c.classroomCode || "Open"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="field-dashboardAIAssignmentStudioModaltsx-2"
                      className="block text-[11px] font-semibold text-indigo-200/80 mb-1"
                    >
                      Assignment Format
                    </label>
                    <select
                      id="field-dashboardAIAssignmentStudioModaltsx-2"
                      value={formatType}
                      onChange={(e) => setFormatType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    >
                      <option value="code" className="bg-[#0f1120]">
                        💻 Coding Lab / Implementation
                      </option>
                      <option value="architecture" className="bg-[#0f1120]">
                        📐 System Design & Architecture
                      </option>
                      <option value="essay" className="bg-[#0f1120]">
                        📝 Technical Analysis & Case Study
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="field-dashboardAIAssignmentStudioModaltsx-3"
                      className="block text-[11px] font-semibold text-indigo-200/80 mb-1"
                    >
                      Target Difficulty
                    </label>
                    <select
                      id="field-dashboardAIAssignmentStudioModaltsx-3"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    >
                      <option value="beginner" className="bg-[#0f1120]">
                        Beginner / Foundational
                      </option>
                      <option value="intermediate" className="bg-[#0f1120]">
                        Intermediate / Industry Grade
                      </option>
                      <option value="advanced" className="bg-[#0f1120]">
                        Advanced / Production Rigor
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    aria-label="Enter topic or prompt: e.g. JWT Auth with Refresh Tokens, Redux State, Binary Trees, SQL Indexing..."
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic or prompt: e.g. JWT Auth with Refresh Tokens, Redux State, Binary Trees, SQL Indexing..."
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30"
                  />
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="px-5 py-2.5 rounded-xl glow-btn-primary text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form to Review & Deploy */}
              <form onSubmit={handleDeployAssignment} className="space-y-4">
                <div>
                  <label
                    htmlFor="field-dashboardAIAssignmentStudioModaltsx-4"
                    className="block text-xs font-bold text-white mb-1"
                  >
                    Assignment Title *
                  </label>
                  <input
                    id="field-dashboardAIAssignmentStudioModaltsx-4"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Implement a High-Throughput Token Bucket Rate Limiter"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-dashboardAIAssignmentStudioModaltsx-5"
                    className="block text-xs font-bold text-white mb-1"
                  >
                    Problem Statement & Instructions (Markdown supported) *
                  </label>
                  <textarea
                    id="field-dashboardAIAssignmentStudioModaltsx-5"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed specifications, input/output requirements, constraints..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grading Rubric */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-teal-300">
                        Grading Rubric (Checklist for Marks)
                      </label>
                      <span className="text-[10px] text-indigo-300/60">
                        Used by AI Auto-Grader
                      </span>
                    </div>
                    <textarea
                      aria-label="1. Correctness: 40%&#10;2. Time Complexity: 30%&#10;3. Clean Typing & Edge Cases: 30%"
                      rows={5}
                      value={rubric}
                      onChange={(e) => setRubric(e.target.value)}
                      placeholder="1. Correctness: 40%&#10;2. Time Complexity: 30%&#10;3. Clean Typing & Edge Cases: 30%"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30"
                    />
                  </div>

                  {/* Master Answer Key */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-amber-300 flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Master Answer Key / Reference Solution</span>
                      </label>
                      <span className="text-[10px] text-amber-300/70 font-semibold">
                        Teacher's Solution
                      </span>
                    </div>
                    <textarea
                      aria-label="Paste the reference answer or code used for instructor review and optional OpenAI grading."
                      rows={5}
                      value={answerKey}
                      onChange={(e) => setAnswerKey(e.target.value)}
                      placeholder="Paste the reference answer or code used for instructor review and optional OpenAI grading."
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono placeholder-indigo-300/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-indigo-500/15">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-indigo-200/70 font-semibold">
                      Max Points:
                    </span>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      className="w-20 px-2.5 py-1.5 rounded-xl glass-input text-xs text-white text-center font-bold"
                    />
                    <span className="text-[11px] text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                      Optional AI grading; unavailable work stays pending
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isDeploying || !title || !description}
                    className="px-6 py-2.5 rounded-xl glow-btn-primary font-bold text-xs flex items-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isDeploying
                        ? "Deploying to Batch..."
                        : "Deploy to Classroom Batch"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 2: LIVE AUTO-GRADEBOOK & STUDENT SUBMISSIONS             */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "gradebook" && (
            <div className="space-y-5">
              {loadingAssignments ? (
                <div className="text-center py-12 text-xs text-indigo-300/60">
                  Loading instructor assignments & gradebook...
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl bg-white/2 border border-indigo-500/10 space-y-3">
                  <BookOpen className="w-10 h-10 text-indigo-400/40 mx-auto" />
                  <h4 className="text-sm font-bold text-white">
                    No Deployed Assignments Yet
                  </h4>
                  <p className="text-xs text-indigo-200/60 max-w-md mx-auto">
                    Create your first assignment using the AI Generator in Tab
                    1. As students submit their solutions, they will be
                    auto-graded and listed here with zero manual copy-pasting!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("create")}
                    className="px-5 py-2 rounded-xl glow-btn-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Your First Assignment</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left Column: Assignment Selector */}
                  <div className="space-y-2.5 md:col-span-1 border-r border-indigo-500/15 pr-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/70">
                      Your Created Assignments
                    </span>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {assignments.map((a: any) => (
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
                          key={a._id}
                          onClick={() => {
                            setSelectedAssignmentId(a._id);
                            setInspectSubmission(null);
                          }}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                            selectedAssignmentId === a._id
                              ? "bg-teal-500/15 border-teal-500/40 text-white"
                              : "bg-white/3 border-indigo-500/10 hover:border-indigo-500/30 text-indigo-200"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-indigo-300/60 mb-1">
                            <span className="font-mono">
                              Batch: {a.course?.classroomCode || "General"}
                            </span>
                            <span>
                              {a.submissions?.length || 0} Submissions
                            </span>
                          </div>
                          <p className="font-bold text-xs line-clamp-1 text-white">
                            {a.title}
                          </p>
                          <p className="text-[10px] text-indigo-300/50 mt-1">
                            Max {a.maxScore} pts •{" "}
                            {a.enableAiGrading ? "AI Graded" : "Manual"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Submissions & Auto-Graded Scores */}
                  <div className="md:col-span-2 space-y-4">
                    {activeAssignment ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/3 border border-indigo-500/15 flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-teal-300 uppercase">
                              Active Assessment:{" "}
                              {activeAssignment.course?.title}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-0.5">
                              {activeAssignment.title}
                            </h3>
                            <p className="text-xs text-indigo-200/70 line-clamp-2 mt-1">
                              {activeAssignment.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <span className="text-xs font-bold text-teal-300 bg-teal-500/20 px-2.5 py-1 rounded-xl border border-teal-400/30">
                              {activeAssignment.submissions?.length || 0}{" "}
                              Students Submitted
                            </span>
                          </div>
                        </div>

                        {/* Submissions List */}
                        {activeAssignment.submissions?.length === 0 ? (
                          <div className="text-center py-10 text-xs text-indigo-300/50 p-6 rounded-2xl bg-white/2 border border-white/5">
                            Waiting for students to submit. Once students
                            submit, AI marks them instantly.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                              Automated Gradebook (Hands-Free Evaluation)
                            </span>
                            <div className="space-y-2">
                              {activeAssignment.submissions.map(
                                (sub: any, idx: number) => (
                                  <div
                                    key={sub._id || idx}
                                    className="p-3.5 rounded-2xl bg-white/4 border border-indigo-500/15 hover:border-indigo-500/35 transition space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center">
                                          {sub.student?.name?.[0] || "S"}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-white">
                                            {sub.student?.name || "Student"}
                                          </p>
                                          <p className="text-[10px] text-indigo-300/60">
                                            {sub.student?.email || "Student"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-white bg-teal-500/20 px-2.5 py-1 rounded-xl border border-teal-400/30">
                                          Score: {sub.score ?? "—"} /{" "}
                                          {activeAssignment.maxScore}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setInspectSubmission(
                                              inspectSubmission?._id === sub._id
                                                ? null
                                                : sub,
                                            )
                                          }
                                          className="text-xs text-teal-400 hover:text-teal-300 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 cursor-pointer"
                                        >
                                          {inspectSubmission?._id === sub._id
                                            ? "Close"
                                            : "View Critique"}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Expanded Inspection Drawer */}
                                    {inspectSubmission?._id === sub._id && (
                                      <div className="pt-3 border-t border-indigo-500/15 space-y-3 animate-in fade-in">
                                        <div>
                                          <span className="text-[10px] font-bold text-indigo-300/70 uppercase">
                                            Student's Submitted Solution:
                                          </span>
                                          <pre className="p-3 rounded-xl bg-black/50 text-[11px] font-mono text-indigo-100 overflow-x-auto mt-1 max-h-40 border border-indigo-500/20">
                                            {sub.content}
                                          </pre>
                                        </div>

                                        {sub.feedback && (
                                          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/25 space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-bold text-teal-300 uppercase">
                                                AI Master Key Critique:
                                              </span>
                                              <span className="text-[10px] text-teal-400">
                                                Automated against Teacher Answer
                                                Key
                                              </span>
                                            </div>
                                            <p className="text-xs text-indigo-100/90 leading-relaxed">
                                              {sub.feedback}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                              <div className="p-2 rounded-lg bg-white/4">
                                                <span className="font-bold text-teal-300 flex items-center gap-1">
                                                  <CheckCircle2 className="w-3 h-3" />{" "}
                                                  Strengths
                                                </span>
                                                <ul className="list-disc list-inside text-indigo-200/80 mt-1 text-[10px]">
                                                  {sub.strengths?.map(
                                                    (st: string, i: number) => (
                                                      <li key={i}>{st}</li>
                                                    ),
                                                  )}
                                                </ul>
                                              </div>
                                              <div className="p-2 rounded-lg bg-white/4">
                                                <span className="font-bold text-amber-300 flex items-center gap-1">
                                                  <AlertTriangle className="w-3 h-3" />{" "}
                                                  Improvements
                                                </span>
                                                <ul className="list-disc list-inside text-indigo-200/80 mt-1 text-[10px]">
                                                  {sub.improvements?.map(
                                                    (im: string, i: number) => (
                                                      <li key={i}>{im}</li>
                                                    ),
                                                  )}
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-xs text-indigo-300/50">
                        Select an assignment from the left to view student
                        submissions.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 3: LIVE QUICK SANDBOX TESTER                             */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "sandbox" && (
            <div className="space-y-4">
              <p className="text-xs text-indigo-200/70">
                Test grading against a custom Answer Key or grade offline
                student answers on the fly without deploying a full course
                assignment.
              </p>

              <form onSubmit={handleSandboxEvaluate} className="space-y-3">
                <div>
                  <label
                    htmlFor="field-dashboardAIAssignmentStudioModaltsx-6"
                    className="block text-xs font-semibold text-indigo-200/80 mb-1"
                  >
                    Assignment Prompt / Question *
                  </label>
                  <input
                    id="field-dashboardAIAssignmentStudioModaltsx-6"
                    type="text"
                    value={sandboxQuestion}
                    onChange={(e) => setSandboxQuestion(e.target.value)}
                    placeholder="e.g. Implement a thread-safe LRU Cache in TypeScript"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="field-dashboardAIAssignmentStudioModaltsx-7"
                      className="block text-xs font-semibold text-teal-300 mb-1"
                    >
                      Grading Rubric
                    </label>
                    <textarea
                      id="field-dashboardAIAssignmentStudioModaltsx-7"
                      rows={2}
                      value={sandboxRubric}
                      onChange={(e) => setSandboxRubric(e.target.value)}
                      placeholder="e.g. Correctness: 40%, Efficiency O(1): 30%, Clean code: 30%"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="field-dashboardAIAssignmentStudioModaltsx-8"
                      className="block text-xs font-semibold text-amber-300 mb-1"
                    >
                      Official Master Answer Key
                    </label>
                    <textarea
                      id="field-dashboardAIAssignmentStudioModaltsx-8"
                      rows={2}
                      value={sandboxAnswerKey}
                      onChange={(e) => setSandboxAnswerKey(e.target.value)}
                      placeholder="Paste your model reference answer or code snippet..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="field-dashboardAIAssignmentStudioModaltsx-9"
                    className="block text-xs font-semibold text-indigo-200/80 mb-1"
                  >
                    Student Answer / Code Submission *
                  </label>
                  <textarea
                    id="field-dashboardAIAssignmentStudioModaltsx-9"
                    rows={4}
                    value={sandboxAnswer}
                    onChange={(e) => setSandboxAnswer(e.target.value)}
                    placeholder="Paste student answer to grade..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={
                      sandboxEvaluating || !sandboxQuestion || !sandboxAnswer
                    }
                    className="px-6 py-2 rounded-xl glow-btn-primary font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {sandboxEvaluating
                        ? "Evaluating..."
                        : "Test Grade with AI"}
                    </span>
                  </button>
                </div>
              </form>

              {/* Sandbox Output */}
              {sandboxResult && (
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-teal-300">
                      Test Evaluation Verdict
                    </span>
                    <span className="text-base font-black text-white bg-teal-500/20 px-3 py-0.5 rounded-xl border border-teal-400/40">
                      {sandboxResult.score} / 100 ({sandboxResult.percentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100/90 leading-relaxed font-medium">
                    {sandboxResult.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-indigo-500/15">
          <span className="text-[11px] text-indigo-300/60">
            Reference-key grading with OpenAI when available; manual review
            remains available
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
}
