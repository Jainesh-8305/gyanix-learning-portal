/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  GripVertical,
  AlertTriangle,
  BookOpen,
  ListOrdered,
  Sparkles,
  Save,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

interface Lesson {
  _id?: string;
  title: string;
  videoUrl: string;
  duration?: number;
  content?: string;
  isFree: boolean;
  order: number;
}

interface Section {
  _id?: string;
  title: string;
  order: number;
  lessons: Lesson[];
  expanded?: boolean;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "curriculum" | "details" | "outcomes"
  >("curriculum");

  // Course fields
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("web-development");
  const [level, setLevel] = useState("beginner");
  const [thumbnail, setThumbnail] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);

  // Sections
  const [sections, setSections] = useState<Section[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data, isLoading, mutate } = useSWR(`/courses/${params.id}`, fetcher);
  const course = data?.data;

  useEffect(() => {
    if (!loaded && course) {
      setTitle(course.title || "");
      setShortDescription(course.shortDescription || "");
      setDescription(course.description || "");
      setCategory(course.category || "web-development");
      setLevel(course.level || "beginner");
      setThumbnail(course.thumbnail || "");
      setTags(course.tags || []);
      setLearningOutcomes(
        course.learningOutcomes?.length ? course.learningOutcomes : [""],
      );
      setRequirements(course.requirements?.length ? course.requirements : [""]);

      if (course.sections) {
        setSections(
          (course.sections || []).map((s: Section) => ({
            ...s,
            expanded: true,
            lessons: (s.lessons || []).map((l: Lesson) => ({
              ...l,
              videoUrl: l.videoUrl ?? "",
              title: l.title ?? "",
              content: l.content ?? "",
              duration:
                (l as Lesson & { videoDuration?: number }).videoDuration ?? 0,
              isFree: !!l.isFree,
            })),
          })),
        );
      }
      setLoaded(true);
    }
  }, [course, loaded]);

  // ── Curriculum Section & Lesson Helpers ───────────────────────────
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        title: "",
        order: prev.length + 1,
        lessons: [],
        expanded: true,
      },
    ]);
  };

  const updateSection = (index: number, key: string, value: any) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    );
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const addLesson = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  title: "",
                  videoUrl: "",
                  duration: 0,
                  content: "",
                  isFree: false,
                  order: s.lessons.length + 1,
                },
              ],
            }
          : s,
      ),
    );
  };

  const updateLesson = (
    sectionIndex: number,
    lessonIndex: number,
    key: string,
    value: any,
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              lessons: s.lessons.map((l, j) =>
                j === lessonIndex ? { ...l, [key]: value ?? "" } : l,
              ),
            }
          : s,
      ),
    );
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              lessons: s.lessons.filter((_, j) => j !== lessonIndex),
            }
          : s,
      ),
    );
  };

  // ── Array Helpers for Outcomes & Requirements ────────────────────
  const handleArrayChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    val: string,
  ) => {
    setter((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const addArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((prev) => [...prev, ""]);
  };

  const removeArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save All Course Changes ──────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        shortDescription,
        description,
        category,
        level,
        thumbnail,
        tags,
        learningOutcomes: learningOutcomes.filter((o) => o.trim()),
        requirements: requirements.filter((r) => r.trim()),
        sections: sections.map((s, sIdx) => ({
          ...s,
          order: sIdx + 1,
          lessons: s.lessons.map((l, lIdx) => ({
            ...l,
            order: lIdx + 1,
            videoUrl: l.videoUrl ?? "",
            title: l.title ?? "",
            videoDuration: Number(l.duration) || 0,
          })),
        })),
      };

      await api.put(`/courses/${params.id}`, payload);
      toast.success("Course updated successfully!");
      mutate();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save course changes",
      );
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // ── Submit Course For Review / Re-publish ────────────────────────
  const handleSubmitForReview = async () => {
    if (!title.trim()) {
      toast.error("Course title is required");
      return;
    }
    if (sections.length === 0) {
      toast.error("Add at least one section before submitting");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save all latest changes first
      await handleSave();
      // 2. Trigger submit for review
      await api.post(`/courses/${params.id}/submit`);
      toast.success("Course submitted to Admin review queue!");
      router.push("/dashboard/instructor");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#05060f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-teal-500/20 border-t-teal-400 rounded-full animate-spin" />
          <p className="text-xs text-indigo-200/60 font-medium">
            Loading Course Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#05060f] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/dashboard/instructor"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300/60 hover:text-teal-300 transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Instructor Deck</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Edit Course Studio
            </h1>
            <p className="text-xs text-indigo-200/60">
              Update course curriculum, media, and learning objectives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${params.id}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-indigo-500/25 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl glow-btn-teal text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 shadow-lg cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting..." : "Submit for Review"}</span>
            </button>
          </div>
        </div>

        {/* ── Admin Feedback Banner (If Changes were requested) ─────── */}
        {course?.adminFeedback && (
          <div className="glass-card rounded-2xl p-5 border border-amber-500/35 bg-amber-500/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Action Required — Admin Revision Instructions
              </p>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                {course.adminFeedback}
              </p>
              <p className="text-[11px] text-amber-200/60 pt-1">
                Make your edits below across any section, details, or lectures,
                then click <strong>"Submit for Review"</strong> to re-publish.
              </p>
            </div>
          </div>
        )}

        {/* ── Tabs Toolbar ────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-2 flex flex-wrap gap-2 border border-indigo-500/20">
          {[
            {
              id: "curriculum",
              label: "1. Curriculum & Lectures",
              icon: ListOrdered,
            },
            {
              id: "details",
              label: "2. Course Details & Media",
              icon: BookOpen,
            },
            {
              id: "outcomes",
              label: "3. Outcomes & Prerequisites",
              icon: Sparkles,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-40 py-2.5 px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-indigo-200/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: Curriculum & Sections ────────────────────────── */}
        {activeTab === "curriculum" && (
          <div className="space-y-4">
            {sections.map((section, sIndex) => (
              <div
                key={sIndex}
                className="glass-card rounded-2xl overflow-hidden border border-indigo-500/20 shadow-xl"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 p-4 bg-[#0a0d20] border-b border-indigo-500/15">
                  <GripVertical className="w-4 h-4 text-indigo-300/40 shrink-0" />
                  <span className="text-xs font-bold text-teal-400 shrink-0">
                    Section {sIndex + 1}:
                  </span>
                  <input
                    aria-label="e.g. Introduction & Fundamentals"
                    value={section.title ?? ""}
                    onChange={(e) =>
                      updateSection(sIndex, "title", e.target.value)
                    }
                    placeholder="e.g. Introduction & Fundamentals"
                    className="flex-1 bg-transparent text-white font-bold placeholder-indigo-300/30 focus:outline-none text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(sIndex, "expanded", !section.expanded)
                      }
                      className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-300/60 hover:text-white transition"
                    >
                      {section.expanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(sIndex)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons in Section */}
                {section.expanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {section.lessons.map((lesson, lIndex) => (
                      <div
                        key={lIndex}
                        className="p-4 rounded-xl bg-white/3 border border-indigo-500/15 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-indigo-300/60 shrink-0">
                            {sIndex + 1}.{lIndex + 1}
                          </span>
                          <input
                            aria-label="Lesson title (e.g. Setting up the Development Environment)"
                            value={lesson.title ?? ""}
                            onChange={(e) =>
                              updateLesson(
                                sIndex,
                                lIndex,
                                "title",
                                e.target.value,
                              )
                            }
                            placeholder="Lesson title (e.g. Setting up the Development Environment)"
                            className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeLesson(sIndex, lIndex)}
                            className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition shrink-0"
                            title="Remove lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <input
                              aria-label="Video Stream URL (YouTube, Vimeo, Cloudinary, MP4)"
                              value={lesson.videoUrl ?? ""}
                              onChange={(e) =>
                                updateLesson(
                                  sIndex,
                                  lIndex,
                                  "videoUrl",
                                  e.target.value,
                                )
                              }
                              placeholder="Video Stream URL (YouTube, Vimeo, Cloudinary, MP4)"
                              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                            />
                          </div>
                          <div>
                            <input
                              aria-label="Duration (mins)"
                              type="number"
                              value={lesson.duration ?? 0}
                              onChange={(e) =>
                                updateLesson(
                                  sIndex,
                                  lIndex,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              placeholder="Duration (mins)"
                              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-indigo-200/70 hover:text-white">
                            <input
                              type="checkbox"
                              checked={!!lesson.isFree}
                              onChange={(e) =>
                                updateLesson(
                                  sIndex,
                                  lIndex,
                                  "isFree",
                                  e.target.checked,
                                )
                              }
                              className="accent-teal-400 rounded cursor-pointer"
                            />
                            <span>
                              Allow Free Preview Lesson (Students can watch
                              without enrolling)
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addLesson(sIndex)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition py-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lecture to Section {sIndex + 1}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addSection}
              className="w-full py-5 rounded-2xl border-2 border-dashed border-indigo-500/25 hover:border-indigo-400/50 bg-white/2 hover:bg-white/5 text-indigo-200/60 hover:text-white transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Add New Section</span>
            </button>
          </div>
        )}

        {/* ── TAB 2: Course Details & Media ───────────────────────── */}
        {activeTab === "details" && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="field-editpagetsx-1"
                  className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2"
                >
                  Course Title
                </label>
                <input
                  id="field-editpagetsx-1"
                  type="text"
                  value={title ?? ""}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Full-Stack Web Development with AI"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="field-editpagetsx-2"
                  className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2"
                >
                  Short Tagline / Summary (Shown on Cards)
                </label>
                <input
                  id="field-editpagetsx-2"
                  type="text"
                  value={shortDescription ?? ""}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A concise 1-2 sentence hook for your course"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="field-editpagetsx-3"
                  className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2"
                >
                  Full Course Description
                </label>
                <textarea
                  id="field-editpagetsx-3"
                  rows={6}
                  value={description ?? ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed overview of what students will achieve, modules covered, and final projects..."
                  className="w-full p-4 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="field-editpagetsx-4"
                    className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="field-editpagetsx-4"
                    value={category ?? "web-development"}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d20]"
                  >
                    <option value="web-development">Web Development</option>
                    <option value="mobile-development">
                      Mobile Development
                    </option>
                    <option value="ai-machine-learning">
                      AI & Machine Learning
                    </option>
                    <option value="data-science">Data Science</option>
                    <option value="cloud-devops">Cloud & DevOps</option>
                    <option value="cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="field-editpagetsx-5"
                    className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2"
                  >
                    Difficulty Level
                  </label>
                  <select
                    id="field-editpagetsx-5"
                    value={level ?? "beginner"}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none bg-[#0a0d20]"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="field-editpagetsx-6"
                  className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2"
                >
                  Thumbnail Image URL
                </label>
                <input
                  id="field-editpagetsx-6"
                  type="text"
                  value={thumbnail ?? ""}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Cloudinary URL"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none"
                />
                {thumbnail && (
                  <div className="mt-3 w-48 h-28 rounded-xl overflow-hidden border border-indigo-500/20 bg-black">
                    <img
                      src={thumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Outcomes & Prerequisites ─────────────────────── */}
        {activeTab === "outcomes" && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6">
            {/* Learning Outcomes */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80">
                What Students Will Learn (Key Outcomes)
              </label>
              {learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-500/15 text-teal-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <input
                    type="text"
                    value={outcome ?? ""}
                    onChange={(e) =>
                      handleArrayChange(
                        setLearningOutcomes,
                        idx,
                        e.target.value,
                      )
                    }
                    placeholder={`Outcome ${idx + 1}: e.g. Build production full-stack SaaS apps with Next.js and MongoDB`}
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(setLearningOutcomes, idx)}
                    className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(setLearningOutcomes)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition pt-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Learning Outcome</span>
              </button>
            </div>

            {/* Prerequisites */}
            <div className="space-y-3 pt-6 border-t border-indigo-500/15">
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80">
                Course Requirements & Prerequisites
              </label>
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    •
                  </span>
                  <input
                    type="text"
                    value={req ?? ""}
                    onChange={(e) =>
                      handleArrayChange(setRequirements, idx, e.target.value)
                    }
                    placeholder={`Requirement ${idx + 1}: e.g. Basic familiarity with HTML, CSS and JavaScript`}
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(setRequirements, idx)}
                    className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(setRequirements)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition pt-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Requirement</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
