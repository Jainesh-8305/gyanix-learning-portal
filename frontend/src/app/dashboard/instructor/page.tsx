"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import useSWR from "swr";
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Plus,
  ArrowRight,
  Copy,
  Pencil,
  Library,
  ClipboardList,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PageHeading,
  Panel,
  Metric,
  Badge,
  Progress,
  EmptyState,
  LoadingState,
  ModalLoading,
  ErrorState,
  QuickLink,
  dateLabel,
} from "@/components/workspace/ui";
const AssignmentStudio = dynamic(
  () => import("@/components/dashboard/AIAssignmentStudioModal"),
  { loading: ModalLoading },
);
const BatchQuiz = dynamic(
  () => import("@/components/dashboard/InstructorBatchQuizModal"),
  { loading: ModalLoading },
);
const ResourceHub = dynamic(
  () => import("@/components/dashboard/FacultyResourcePinModal"),
  { loading: ModalLoading },
);
const QuizGenerator = dynamic(
  () =>
    import("@/components/quiz/AIQuizGenerator").then((m) => m.AIQuizGenerator),
  { loading: ModalLoading },
);
const Gradebook = dynamic(
  () => import("@/components/workspace/InstructorGradebook"),
  { loading: () => <LoadingState label="Loading gradebook…" /> },
);
const Details = dynamic(
  () => import("@/components/dashboard/InstructorStatDetailsModal"),
  { loading: ModalLoading },
);
interface Course {
  _id: string;
  title: string;
  status: string;
  category: string;
  level: string;
  classroomCode?: string;
  totalLessons: number;
  totalStudents: number;
  rating?: number;
  totalRatings?: number;
}
interface Student {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  progressPercentage: number;
  isCompleted: boolean;
  enrolledAt: string;
}
interface Review {
  id: string;
  studentName: string;
  courseTitle: string;
  rating: number;
  reviewText: string;
  reviewedAt: string;
}
interface Overview {
  courses: Course[];
  students: Student[];
  reviews: Review[];
  averageRating: number;
  ratingDistribution: Record<string, number>;
}
interface Quiz {
  _id: string;
  title: string;
  timeLimit: number;
  maxAttempts: number;
  dueDate?: string;
  generationMode?: string;
}
export default function InstructorDashboard() {
  const user = useAuthStore((s) => s.user),
    params = useSearchParams();
  const raw = params.get("tab") || "overview";
  const tab =
    ({ cadets: "students", analytics: "reviews" } as Record<string, string>)[
      raw
    ] || raw;
  const { data, error, isLoading, mutate } = useSWR<{ data: Course[] }>(
    "/courses/my-courses",
  );
  const {
    data: overviewData,
    error: overviewError,
    isLoading: loadingOverview,
    mutate: refreshOverview,
  } = useSWR<{ data: Overview }>(
    ["students", "reviews"].includes(tab)
      ? "/courses/instructor-overview"
      : null,
  );
  const [studio, setStudio] = useState(false),
    [batch, setBatch] = useState(false),
    [resource, setResource] = useState<Course>(),
    [generator, setGenerator] = useState(false),
    [selectedCourse, setSelectedCourse] = useState(""),
    [search, setSearch] = useState(""),
    [details, setDetails] = useState<
      "courses" | "cadets" | "reviews" | "ratings" | null
    >(null);
  const courses = data?.data || [],
    courseId = selectedCourse || courses[0]?._id;
  const {
    data: quizData,
    mutate: refreshQuizzes,
    error: quizError,
    isLoading: loadingQuizzes,
  } = useSWR<{ data: Quiz[] }>(
    tab === "quizzes" && courseId ? `/quizzes/course/${courseId}` : null,
  );
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState retry={() => void mutate()} />;
  const overview = overviewData?.data,
    published = courses.filter((c) => c.status === "published"),
    pending = courses.filter((c) => c.status === "pending"),
    reviews = courses.reduce((n, c) => n + (c.totalRatings || 0), 0),
    rating = reviews
      ? courses.reduce(
          (n, c) => n + (c.rating || 0) * (c.totalRatings || 0),
          0,
        ) / reviews
      : 0;
  const copy = (code: string) => {
    void navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Classroom code copied"))
      .catch(() => toast.error("Copy is unavailable"));
  };
  async function toggle(id: string) {
    try {
      await api.post(`/courses/${id}/toggle-publish`);
      await mutate();
      await refreshOverview();
    } catch (e) {
      toast.error(apiError(e, "Could not update course status"));
    }
  }
  const title =
    tab === "overview"
      ? `Welcome back, ${user?.name?.split(" ")[0] || "instructor"}`
      : (
          {
            students: "Your students",
            assignments: "Assignment studio",
            quizzes: "Classroom quizzes",
            resources: "Course resources",
            reviews: "Reviews & analytics",
          } as Record<string, string>
        )[tab] || "Teaching overview";
  const courseTable = (
    <div className="ws-table-wrap">
      <table className="ws-table">
        <caption className="sr-only">
          Your course status and classroom controls
        </caption>
        <thead>
          <tr>
            <th>Course</th>
            <th>Status</th>
            <th>Classroom</th>
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {courses.slice(0, 6).map((c) => (
            <tr key={c._id}>
              <td>
                <h3>{c.title}</h3>
                <p className="ws-small ws-muted">
                  {c.totalLessons} lessons · {c.totalStudents} enrollments
                </p>
              </td>
              <td>
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
              </td>
              <td>
                {c.classroomCode ? (
                  <button
                    className="ws-link"
                    onClick={() => copy(c.classroomCode!)}
                    aria-label={`Copy code for ${c.title}`}
                  >
                    <Copy size={13} />
                    {c.classroomCode}
                  </button>
                ) : (
                  "—"
                )}
              </td>
              <td>
                <div className="ws-actions">
                  <Link
                    className="ws-link"
                    href={`/dashboard/instructor/courses/${c._id}/edit`}
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <button
                    className="ws-link"
                    onClick={() => setResource(c)}
                    aria-label={`Resources for ${c.title}`}
                  >
                    <Library size={14} />
                    Resources
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <>
      <PageHeading
        eyebrow="Instructor workspace"
        title={title}
        description="Plan your curriculum, support your students and manage classroom work."
        actions={
          <>
            <button
              className="ws-button ws-secondary"
              onClick={() => setStudio(true)}
            >
              <ClipboardList size={16} />
              Assignment studio
            </button>
            <Link
              href="/dashboard/instructor/courses/create"
              className="ws-button"
            >
              <Plus size={16} />
              Create course
            </Link>
          </>
        }
      />
      <div className="ws-stack">
        {tab === "overview" && (
          <>
            <div className="ws-metrics">
              <Metric
                label="Published courses"
                value={published.length}
                hint={`${courses.length} total courses`}
                icon={<BookOpen size={17} />}
              />
              <Metric
                label="Course enrollments"
                value={courses.reduce((n, c) => n + c.totalStudents, 0)}
                hint="Across your own courses"
                icon={<Users size={17} />}
              />
              <Metric
                label="Awaiting approval"
                value={pending.length}
                hint="Submitted for administrator review"
                icon={<Clock size={17} />}
              />
              <Metric
                label="Average rating"
                value={rating ? rating.toFixed(1) : "—"}
                hint={
                  reviews
                    ? `${reviews} student ratings`
                    : "No ratings received yet"
                }
                icon={<Star size={17} />}
              />
            </div>
            <Panel
              title="Your courses"
              description="Published classes and curricula in progress."
              action={
                <Link className="ws-link" href="/dashboard/instructor/courses">
                  Manage all
                  <ArrowRight size={14} />
                </Link>
              }
            >
              {courses.length ? (
                courseTable
              ) : (
                <EmptyState
                  title="Build your first course"
                  description="Create a draft, add your lectures and submit the curriculum for review."
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
            <div className="ws-grid">
              <QuickLink
                href="/dashboard/instructor?tab=assignments"
                title="Assignments & gradebook"
                description="Draft classroom work, review student submissions and save grades."
                icon={<ClipboardList size={21} />}
              />
              <QuickLink
                href="/dashboard/instructor?tab=quizzes"
                title="Classroom quizzes"
                description="Create batch quizzes or review question drafts before saving them."
                icon={<Brain size={21} />}
              />
              <QuickLink
                href="/dashboard/instructor?tab=resources"
                title="Resource hubs"
                description="Share useful books, videos and official documentation per course."
                icon={<Library size={21} />}
              />
              <QuickLink
                href="/dashboard/instructor?tab=students"
                title="Student progress"
                description="See your course rosters, completion and classroom engagement."
                icon={<Users size={21} />}
              />
            </div>
            <p className="ws-note">
              All published courses are free. Save changes as a draft, then
              submit for administrator review. Existing learning records remain
              intact when a course is archived.
            </p>
          </>
        )}
        {tab === "students" && (
          <Panel
            title="Enrolled students"
            description="Students enrolled in the courses you own."
          >
            <div className="ws-toolbar">
              <label className="ws-field">
                <span className="sr-only">Search students or courses</span>
                <input
                  className="ws-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students or courses"
                />
              </label>
              <Badge>{overview?.students.length || 0} enrollments</Badge>
            </div>
            {loadingOverview ? (
              <LoadingState />
            ) : overviewError ? (
              <ErrorState retry={() => void refreshOverview()} />
            ) : overview?.students.length ? (
              <div className="ws-table-wrap">
                <table className="ws-table">
                  <caption className="sr-only">
                    Your enrolled student roster
                  </caption>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Progress</th>
                      <th>Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.students
                      .filter((s) =>
                        (
                          s.studentName +
                          " " +
                          s.studentEmail +
                          " " +
                          s.courseTitle
                        )
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((s) => (
                        <tr key={s.enrollmentId}>
                          <td>
                            <h3>{s.studentName}</h3>
                            <p className="ws-small ws-muted">
                              {s.studentEmail}
                            </p>
                          </td>
                          <td>{s.courseTitle}</td>
                          <td>
                            <Progress value={s.progressPercentage} />
                          </td>
                          <td>{dateLabel(s.enrolledAt)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Your classroom roster will appear here"
                description="Share a published course or classroom code with your students."
              />
            )}
          </Panel>
        )}
        {tab === "assignments" && (
          <>
            <Panel
              title="Assignment studio"
              description="Create reviewed assignments, reference keys and grading criteria."
            >
              <div className="ws-grid">
                <div className="ws-note">
                  Generate a draft with the configured LLM or start with a
                  labelled offline template. Review every field before deploying
                  it to a classroom.
                </div>
                <div className="ws-actions">
                  <button className="ws-button" onClick={() => setStudio(true)}>
                    <Plus size={16} />
                    Open assignment studio
                  </button>
                </div>
              </div>
            </Panel>
            <Gradebook />
          </>
        )}
        {tab === "quizzes" && (
          <Panel
            title="Saved classroom quizzes"
            description="Choose a course to inspect its quizzes, or create a new assessment."
            action={
              <div className="ws-actions">
                <button
                  className="ws-button ws-secondary"
                  onClick={() => setGenerator(true)}
                  disabled={!courses.length}
                >
                  Review a question draft
                </button>
                <button
                  className="ws-button"
                  onClick={() => setBatch(true)}
                  disabled={!courses.length}
                >
                  <Plus size={16} />
                  Create batch quiz
                </button>
              </div>
            }
          >
            <label className="ws-field mb-6">
              Course
              <select
                className="ws-input"
                value={courseId || ""}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="" disabled>
                  Select a course
                </option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            {loadingQuizzes ? (
              <LoadingState label="Loading saved quizzes…" />
            ) : quizError ? (
              <ErrorState retry={() => void refreshQuizzes()} />
            ) : quizData?.data.length ? (
              <div className="ws-table-wrap">
                <table className="ws-table">
                  <caption className="sr-only">
                    Saved quizzes for this course
                  </caption>
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Time limit</th>
                      <th>Due date</th>
                      <th>Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizData.data.map((q) => (
                      <tr key={q._id}>
                        <td>
                          <h3>{q.title}</h3>
                          <Badge>
                            {q.generationMode === "offline"
                              ? "Offline template"
                              : q.generationMode === "live"
                                ? "LLM draft"
                                : "Instructor quiz"}
                          </Badge>
                        </td>
                        <td>{q.timeLimit} minutes</td>
                        <td>{dateLabel(q.dueDate)}</td>
                        <td>{q.maxAttempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No quizzes for this course yet"
                description="Create a batch quiz or review generated questions before saving an instructor quiz."
              />
            )}
            <p className="ws-note mt-5">
              Server-owned answer keys, timers and attempt limits protect
              assessment integrity. Offline templates are generic and require
              instructor review.
            </p>
          </Panel>
        )}
        {tab === "resources" && (
          <Panel
            title="Resource hubs"
            description="Keep the books, videos and documentation for each classroom together."
          >
            {courses.length ? (
              <div className="ws-grid">
                {courses.map((c) => (
                  <div className="ws-tool" key={c._id}>
                    <Library size={23} className="ws-tool-icon" />
                    <div>
                      <h3>{c.title}</h3>
                      <p>
                        {c.status} · {c.totalLessons} lessons
                      </p>
                      <button
                        className="ws-link mt-4"
                        onClick={() => setResource(c)}
                      >
                        Manage resources
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Create a course first"
                description="Each course has its own resource hub for enrolled students."
              />
            )}
          </Panel>
        )}
        {tab === "reviews" && (
          <>
            {loadingOverview ? (
              <LoadingState />
            ) : overviewError ? (
              <ErrorState retry={() => void refreshOverview()} />
            ) : (
              overview && (
                <>
                  <div className="ws-metrics">
                    <Metric
                      label="Average student rating"
                      value={
                        overview.averageRating
                          ? overview.averageRating.toFixed(1)
                          : "—"
                      }
                      hint="Based on received course ratings"
                      icon={<Star size={17} />}
                    />
                    <Metric
                      label="Student reviews"
                      value={overview.reviews.length}
                      icon={<ClipboardList size={17} />}
                    />
                    <Metric
                      label="Course enrollments"
                      value={overview.students.length}
                      icon={<Users size={17} />}
                    />
                    <Metric
                      label="Completed enrollments"
                      value={
                        overview.students.filter((s) => s.isCompleted).length
                      }
                      icon={<BookOpen size={17} />}
                    />
                  </div>
                  <div className="ws-grid">
                    <Panel
                      title="Rating distribution"
                      action={
                        <button
                          className="ws-link"
                          onClick={() => setDetails("ratings")}
                        >
                          Details
                          <ArrowRight size={14} />
                        </button>
                      }
                    >
                      <div className="ws-list">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div className="ws-list-item" key={stars}>
                            <span>{stars} stars</span>
                            <strong>
                              {overview.ratingDistribution[stars] || 0}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </Panel>
                    <Panel
                      title="Recent reviews"
                      action={
                        <button
                          className="ws-link"
                          onClick={() => setDetails("reviews")}
                        >
                          View all
                          <ArrowRight size={14} />
                        </button>
                      }
                    >
                      {overview.reviews.length ? (
                        <div className="ws-list">
                          {overview.reviews.slice(0, 4).map((r) => (
                            <article className="ws-list-item" key={r.id}>
                              <div>
                                <h3>
                                  {r.studentName} · {r.rating}/5
                                </h3>
                                <p className="ws-small ws-muted">
                                  {r.courseTitle}
                                </p>
                                <p className="ws-description mt-3">
                                  {r.reviewText}
                                </p>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="No reviews yet"
                          description="Student reviews will appear after they submit feedback for your courses."
                        />
                      )}
                    </Panel>
                  </div>
                </>
              )
            )}
          </>
        )}
      </div>
      {studio && (
        <AssignmentStudio courses={courses} onClose={() => setStudio(false)} />
      )}{" "}
      {batch && (
        <BatchQuiz
          isOpen
          courses={courses}
          onClose={() => setBatch(false)}
          onQuizCreated={() => {
            void refreshQuizzes();
          }}
        />
      )}
      {resource && (
        <ResourceHub
          courseId={resource._id}
          courseTitle={resource.title}
          onClose={() => setResource(undefined)}
        />
      )}{" "}
      {generator && courseId && (
        <QuizGenerator
          courseId={courseId}
          onClose={() => setGenerator(false)}
          onCreated={() => {
            void refreshQuizzes();
          }}
        />
      )}
      {details && overview && (
        <Details
          type={details}
          onClose={() => setDetails(null)}
          data={overview}
          onCopyBatchCode={copy}
          onTogglePublish={toggle}
        />
      )}
    </>
  );
}
