/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { BookOpen, Video, FileCode, Plus, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface FacultyResourcePinModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  onSaved?: () => void;
}

export default function FacultyResourcePinModal({
  courseId,
  courseTitle,
  onClose,
  onSaved,
}: FacultyResourcePinModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose, true);

  const [activeTab, setActiveTab] = useState<"books" | "videos" | "docs">(
    "books",
  );

  // Form inputs
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookLink, setBookLink] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");

  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const [booksList, setBooksList] = useState<any[]>([]);
  const [videosList, setVideosList] = useState<any[]>([]);
  const [docsList, setDocsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAddBook = () => {
    if (!bookTitle.trim()) return;
    setBooksList([
      ...booksList,
      { title: bookTitle, author: bookAuthor, link: bookLink, isbn: bookIsbn },
    ]);
    setBookTitle("");
    setBookAuthor("");
    setBookLink("");
    setBookIsbn("");
  };

  const handleAddVideo = () => {
    if (!videoTitle.trim() || !videoUrl.trim()) return;
    setVideosList([
      ...videosList,
      { title: videoTitle, url: videoUrl, platform: "YouTube" },
    ]);
    setVideoTitle("");
    setVideoUrl("");
  };

  const handleAddDoc = () => {
    if (!docTitle.trim() || !docUrl.trim()) return;
    setDocsList([
      ...docsList,
      { title: docTitle, url: docUrl, provider: "Official Docs" },
    ]);
    setDocTitle("");
    setDocUrl("");
  };

  const handleSaveHub = async () => {
    setSaving(true);
    try {
      await api.post(`/ai/resource-hub/${courseId}`, {
        recommendedBooks: booksList,
        recommendedVideos: videosList,
        officialDocs: docsList,
      });
      toast.success("📚 Faculty Resource Hub saved and pinned for students!");
      if (onSaved) onSaved();
      onClose();
    } catch {
      toast.error("Failed to pin course resources");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="glass-card max-w-2xl w-full rounded-3xl p-6 sm:p-8 border border-teal-500/30 bg-[#0c0f24] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-500/15">
          <div>
            <span className="text-[10px] font-bold uppercase text-teal-400">
              Course Master Pinning
            </span>
            <h3 className="text-lg font-bold text-white">
              Curate Resources: {courseTitle}
            </h3>
          </div>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="text-indigo-300/60 hover:text-white text-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/4 border border-indigo-500/20">
          <button
            onClick={() => setActiveTab("books")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "books"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-indigo-200/70"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Textbooks ({booksList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "videos"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                : "text-indigo-200/70"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({videosList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "docs"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-indigo-200/70"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Official Docs ({docsList.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "books" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                aria-label="Book Title *"
                type="text"
                placeholder="Book Title *"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
              <input
                aria-label="Author Name"
                type="text"
                placeholder="Author Name"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                aria-label="ISBN (optional)"
                type="text"
                placeholder="ISBN (optional)"
                value={bookIsbn}
                onChange={(e) => setBookIsbn(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
              <input
                aria-label="Library or resource URL"
                type="text"
                placeholder="Library or resource URL"
                value={bookLink}
                onChange={(e) => setBookLink(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>
            <button
              onClick={handleAddBook}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Book to Hub
            </button>

            {booksList.length > 0 && (
              <div className="space-y-1 pt-2 max-h-36 overflow-y-auto">
                {booksList.map((b, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-white/4 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-white">
                      {b.title} ({b.author || "Author"})
                    </span>
                    <button
                      onClick={() =>
                        setBooksList(booksList.filter((_, idx) => idx !== i))
                      }
                      className="text-rose-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="space-y-3">
            <input
              aria-label="Lecture / Video Title *"
              type="text"
              placeholder="Lecture / Video Title *"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            />
            <input
              aria-label="YouTube or Video URL *"
              type="text"
              placeholder="YouTube or Video URL *"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            />
            <button
              onClick={handleAddVideo}
              className="px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Video Lecture
            </button>

            {videosList.length > 0 && (
              <div className="space-y-1 pt-2 max-h-36 overflow-y-auto">
                {videosList.map((v, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-white/4 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-white">{v.title}</span>
                    <button
                      onClick={() =>
                        setVideosList(videosList.filter((_, idx) => idx !== i))
                      }
                      className="text-rose-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "docs" && (
          <div className="space-y-3">
            <input
              aria-label="Documentation Title (e.g. Official React 19 Docs) *"
              type="text"
              placeholder="Documentation Title (e.g. Official React 19 Docs) *"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            />
            <input
              aria-label="Documentation URL *"
              type="text"
              placeholder="Documentation URL *"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            />
            <button
              onClick={handleAddDoc}
              className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Official Documentation
            </button>

            {docsList.length > 0 && (
              <div className="space-y-1 pt-2 max-h-36 overflow-y-auto">
                {docsList.map((d, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-white/4 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-white">{d.title}</span>
                    <button
                      onClick={() =>
                        setDocsList(docsList.filter((_, idx) => idx !== i))
                      }
                      className="text-rose-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-indigo-500/15">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveHub}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl glow-btn-teal font-bold text-xs inline-flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {saving ? "Pinning Resources..." : "Pin Resources to Course"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
