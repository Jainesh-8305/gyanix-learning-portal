"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import useSWR from "swr";
import {
  Plus,
  Pencil,
  Eye,
  Library,
  Send,
  Archive,
  Copy,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import {
  PageHeading,
  Panel,
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
  ModalLoading,
} from "@/components/workspace/ui";
const ResourceHub = dynamic(
  () => import("@/components/dashboard/FacultyResourcePinModal"),
  { loading: ModalLoading },
);
interface Course {
  _id: string;
  title: string;
  status: string;
  category: string;
  level: string;
  classroomCode: string;
  totalLessons: number;
  totalStudents: number;
  adminFeedback?: string;
}
function ArchiveDialog({
  course,
  onClose,
  onDone,
}: {
  course: Course;
  onClose: () => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  const [saving, setSaving] = useState(false);
  async function archive() {
    setSaving(true);
    try {
      await api.delete("/courses/" + course._id);
      onDone();
      onClose();
      toast.success("Course archived. Learning records retained.");
    } catch (e) {
      toast.error(apiError(e, "Could not archive course"));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="ws-dialog-backdrop">
      <div className="ws-dialog" ref={ref}>
        <header>
          <h2>Archive this course?</h2>
          <button
            aria-label="Close archive dialog"
            className="ws-button ws-secondary"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </header>
        <p className="ws-description">
          “{course.title}” will no longer be available to new students. Existing
          enrollment, assignment and assessment records are retained. Ask an
          administrator if you need to restore publication.
        </p>
        <div className="ws-actions mt-6">
          <button
            className="ws-button ws-danger"
            disabled={saving}
            onClick={() => void archive()}
          >
            {saving ? "Archiving…" : "Archive course"}
          </button>
          <button className="ws-button ws-secondary" onClick={onClose}>
            Keep course
          </button>
        </div>
      </div>
    </div>
  );
}
export default function InstructorCourses() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Course[] }>(
    "/courses/my-courses",
  );
  const [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [busy, setBusy] = useState(""),
    [resource, setResource] = useState<Course>(),
    [archive, setArchive] = useState<Course>();
  const courses = data?.data || [],
    visible = courses.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        c.title.toLowerCase().includes(search.toLowerCase()),
    );
  async function submit(course: Course) {
    setBusy(course._id);
    try {
      await api.post(`/courses/${course._id}/submit`);
      await mutate();
      toast.success("Course submitted for administrator review");
    } catch (e) {
      toast.error(apiError(e, "Could not submit course"));
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="Instructor workspace"
        title="Your courses"
        description="Build curricula, manage classroom resources and track publication status."
        actions={
          <Link
            className="ws-button"
            href="/dashboard/instructor/courses/create"
          >
            <Plus size={16} />
            Create course
          </Link>
        }
      />
      <Panel
        title="Course directory"
        description="All published courses use free enrollment."
      >
        <div className="ws-toolbar">
          <label className="ws-field">
            <span className="sr-only">Search your courses</span>
            <input
              className="ws-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your courses"
            />
          </label>
          <label className="ws-field">
            <span className="sr-only">Filter course status</span>
            <select
              className="ws-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "all",
                "draft",
                "pending",
                "published",
                "rejected",
                "hidden",
                "archived",
              ].map((f) => (
                <option value={f} key={f}>
                  {f === "all"
                    ? "All statuses"
                    : f[0].toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState retry={() => void mutate()} />
        ) : visible.length ? (
          <div className="ws-stack">
            {visible.map((c) => (
              <article className="ws-governance-course" key={c._id}>
                <header>
                  <div>
                    <div className="ws-actions mb-3">
                      <Badge
                        tone={
                          c.status === "published"
                            ? "success"
                            : c.status === "pending"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {c.status}
                      </Badge>
                      <span className="ws-small ws-muted">
                        {c.category} · {c.level}
                      </span>
                    </div>
                    <h3>{c.title}</h3>
                    <p className="ws-small ws-muted mt-2">
                      {c.totalLessons} lessons · {c.totalStudents} enrollments ·
                      Free enrollment
                    </p>
                  </div>
                  <button
                    className="ws-link"
                    aria-label={`Copy classroom code for ${c.title}`}
                    onClick={() =>
                      navigator.clipboard
                        .writeText(c.classroomCode)
                        .then(() => toast.success("Classroom code copied"))
                        .catch(() => toast.error("Copy is unavailable"))
                    }
                  >
                    <Copy size={13} />
                    {c.classroomCode}
                  </button>
                </header>
                {c.adminFeedback && (
                  <p className="ws-note mt-5">
                    Administrator feedback: {c.adminFeedback}
                  </p>
                )}
                <div className="ws-actions mt-5">
                  <Link
                    className="ws-button ws-secondary"
                    href={`/dashboard/instructor/courses/${c._id}/edit`}
                  >
                    <Pencil size={15} />
                    Edit curriculum
                  </Link>
                  <Link
                    className="ws-button ws-secondary"
                    href={`/courses/${c._id}`}
                  >
                    <Eye size={15} />
                    Preview
                  </Link>
                  <button
                    className="ws-button ws-secondary"
                    onClick={() => setResource(c)}
                  >
                    <Library size={15} />
                    Resources
                  </button>
                  {["draft", "rejected", "hidden"].includes(c.status) && (
                    <button
                      className="ws-button"
                      disabled={busy === c._id}
                      onClick={() => void submit(c)}
                    >
                      <Send size={15} />
                      {busy === c._id ? "Submitting…" : "Submit for review"}
                    </button>
                  )}
                  {c.status !== "archived" && (
                    <button className="ws-link" onClick={() => setArchive(c)}>
                      <Archive size={14} />
                      Archive
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching courses"
            description="Try another status filter or create a new curriculum."
            action={
              <Link
                className="ws-button"
                href="/dashboard/instructor/courses/create"
              >
                Create a course
              </Link>
            }
          />
        )}
      </Panel>
      {resource && (
        <ResourceHub
          courseId={resource._id}
          courseTitle={resource.title}
          onClose={() => setResource(undefined)}
        />
      )}{" "}
      {archive && (
        <ArchiveDialog
          course={archive}
          onClose={() => setArchive(undefined)}
          onDone={() => void mutate()}
        />
      )}
    </>
  );
}
