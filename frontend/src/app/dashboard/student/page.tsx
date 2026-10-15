"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import useSWR from "swr";
import {
  BookOpen,
  Award,
  Layers,
  CalendarDays,
  Plus,
  Search,
  FileText,
  Brain,
  Library,
  ArrowRight,
  Copy,
  Heart,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";
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
const JoinBatchModal = dynamic(
  () => import("@/components/dashboard/JoinBatchModal"),
  { loading: ModalLoading },
);
const AssignmentDialog = dynamic(
  () => import("@/components/workspace/StudentAssignmentDialog"),
  { loading: ModalLoading },
);
const StudyCalendar = dynamic(
  () => import("@/components/workspace/StudyCalendar"),
  { loading: ModalLoading },
);
interface Course {
  _id: string;
  title: string;
  category: string;
  status: string;
  classroomCode?: string;
  totalLessons: number;
  instructor?: { name: string };
}
interface Enrollment {
  _id: string;
  course: Course;
  progressPercentage: number;
  isCompleted: boolean;
  completedLessons: { lessonId: string; completedAt: string }[];
  lastAccessedAt?: string;
  createdAt: string;
}
interface Assignment {
  _id: string;
  title: string;
  course: { _id: string; title: string };
  dueDate?: string;
  maxScore: number;
  submissions: { score?: number; submittedAt: string }[];
}
interface Quiz {
  _id: string;
  title: string;
  course: { _id: string; title: string };
  timeLimit: number;
  dueDate?: string;
  generationMode?: string;
}
interface Attempt {
  _id: string;
  quiz?: { title: string };
  percentage: number;
  updatedAt: string;
}
interface Certificate {
  _id: string;
  certificateId: string;
  courseTitle: string;
  completedAt: string;
}
interface Data {
  enrollments: Enrollment[];
  assignments: Assignment[];
  quizzes: Quiz[];
  attempts: Attempt[];
  certificates: Certificate[];
  stats: {
    assessmentCount: number;
    certificateCount: number;
    enrolled: number;
    completed: number;
    lessonsCompleted: number;
    totalLessons: number;
    lessonsToday: number;
    streak: number;
    averageProgress: number;
    flashcards: number;
    flashcardsDue: number;
    reviewedToday: number;
  };
}
const quotes = [
  "Small daily steps make difficult things possible.",
  "Every expert started with a question.",
  "Progress grows through practice, patience and curiosity.",
  "Focus on the next lesson. Let consistency do the rest.",
];
export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user),
    params = useSearchParams();
  const raw = params.get("tab") || "overview";
  const tab =
    (
      { "ai-learning": "tools", analytics: "progress" } as Record<
        string,
        string
      >
    )[raw] || raw;
  const { data, error, isLoading, mutate } = useSWR<{ data: Data }>(
    "/dashboard/student",
  );
  const [join, setJoin] = useState(false),
    [assignment, setAssignment] = useState<string>(),
    [calendar, setCalendar] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [quote, setQuote] = useState(0),
    [liked, setLiked] = useState(false);
  const dashboard = data?.data;
  if (isLoading) return <LoadingState />;
  if (error || !dashboard) return <ErrorState retry={() => void mutate()} />;
  const { enrollments, assignments, quizzes, certificates, attempts, stats } =
    dashboard;
  const current = enrollments.filter(
    (e) => e.course.status === "published" && !e.isCompleted,
  );
  const pending = assignments.filter((a) => !a.submissions.length);
  const events = [
    ...assignments
      .filter((a) => a.dueDate)
      .map((a) => ({ id: a._id, title: a.title, date: a.dueDate! })),
    ...quizzes
      .filter((q) => q.dueDate)
      .map((q) => ({ id: q._id, title: q.title, date: q.dueDate! })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const future = events
    .filter((e) => new Date(e.date) >= new Date())
    .slice(0, 4);
  const courseRows = (list: Enrollment[]) => (
    <div className="ws-table-wrap">
      <table className="ws-table">
        <caption className="sr-only">
          Your enrolled courses and progress
        </caption>
        <thead>
          <tr>
            <th>Course</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Access</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e) => (
            <tr key={e._id}>
              <td>
                <h3>{e.course.title}</h3>
                <p className="ws-small ws-muted">
                  {e.course.instructor?.name} · {e.course.totalLessons} lessons
                </p>
                {e.course.classroomCode && (
                  <button
                    className="ws-link mt-2"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(e.course.classroomCode!)
                        .then(() => toast.success("Classroom code copied"))
                        .catch(() => toast.error("Copy is unavailable"))
                    }
                    aria-label={`Copy classroom code for ${e.course.title}`}
                  >
                    <Copy size={12} />
                    {e.course.classroomCode}
                  </button>
                )}
              </td>
              <td>
                <Progress value={e.progressPercentage} />
              </td>
              <td>
                <Badge
                  tone={
                    e.isCompleted
                      ? "success"
                      : e.course.status !== "published"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {e.isCompleted
                    ? "Completed"
                    : e.course.status !== "published"
                      ? "Unavailable"
                      : "In progress"}
                </Badge>
              </td>
              <td>
                {e.course.status === "published" ? (
                  <Link
                    className="ws-link"
                    href={`/courses/${e.course._id}/learn`}
                  >
                    Continue
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span className="ws-small ws-muted">Contact instructor</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const metrics = (
    <div className="ws-metrics">
      <Metric
        label="Enrolled courses"
        value={stats.enrolled}
        hint={`${stats.completed} completed`}
        icon={<BookOpen size={17} />}
      />
      <Metric
        label="Lessons completed"
        value={stats.lessonsCompleted}
        hint={`${stats.totalLessons} lessons in your curricula`}
        icon={<Layers size={17} />}
      />
      <Metric
        label="Certificates"
        value={stats.certificateCount}
        hint="Earned after passing assessments"
        icon={<Award size={17} />}
      />
      <Metric
        label="Flashcards due"
        value={stats.flashcardsDue}
        hint={`${stats.flashcards} cards · ${stats.reviewedToday} reviewed today`}
        icon={<Brain size={17} />}
      />
    </div>
  );
  const tools = (
    <div className="ws-grid">
      <QuickLink
        href="/dashboard/student/notes"
        title="Notes & resources"
        description="Summarize text or PDFs, save private notes and open instructor resources."
        icon={<FileText size={21} />}
      />
      <QuickLink
        href="/dashboard/student/flashcards"
        title="Spaced-repetition flashcards"
        description="Create cards, practise recall and follow your saved review schedule."
        icon={<Layers size={21} />}
      />
      <QuickLink
        href="/dashboard/student/revision-quiz"
        title="Revision quizzes"
        description="Choose a topic and practise with 3, 5 or 10 questions."
        icon={<Brain size={21} />}
      />
      <QuickLink
        href="/help"
        title="Help & documentation"
        description="Find clear instructions for courses, assessments, study tools and your account."
        icon={<Library size={21} />}
      />
    </div>
  );
  return (
    <>
      <PageHeading
        eyebrow="Student workspace"
        title={
          tab === "overview"
            ? `Welcome back, ${user?.name?.split(" ")[0] || "learner"}`
            : (
                {
                  courses: "My courses",
                  tools: "Study tools",
                  assignments: "Assignments",
                  quizzes: "Quizzes",
                  certificates: "Certificates",
                  progress: "My progress",
                } as Record<string, string>
              )[tab] || "Your learning workspace"
        }
        description={
          tab === "overview"
            ? "Your courses, upcoming work and study progress, together in one place."
            : "Everything you need to keep your learning organised and moving forward."
        }
        actions={
          <>
            <Link href="/courses" className="ws-button ws-secondary">
              <Search size={16} />
              Browse courses
            </Link>
            <button className="ws-button" onClick={() => setJoin(true)}>
              <Plus size={16} />
              Join classroom
            </button>
          </>
        }
      />
      <div className="ws-stack">
        {tab === "overview" && (
          <>
            {metrics}
            <div className="ws-columns">
              <Panel
                title="Continue learning"
                description="Pick up where you left off."
                action={
                  <Link
                    href="/dashboard/student?tab=courses"
                    className="ws-link"
                  >
                    All courses
                    <ArrowRight size={14} />
                  </Link>
                }
              >
                {current.length ? (
                  courseRows(current.slice(0, 3))
                ) : (
                  <EmptyState
                    title="Your next learning opportunity"
                    description="Enroll in a published course or join your instructor’s classroom to get started."
                    action={
                      <Link href="/courses" className="ws-button">
                        Explore free courses
                      </Link>
                    }
                  />
                )}
              </Panel>
              <Panel
                title="Upcoming deadlines"
                description="From your saved assignments and classroom quizzes."
                action={
                  <button
                    aria-label="Open study calendar"
                    className="ws-link"
                    onClick={() => setCalendar(true)}
                  >
                    <CalendarDays size={17} />
                  </button>
                }
              >
                {future.length ? (
                  <div className="ws-list">
                    {future.map((e) => (
                      <div className="ws-list-item" key={e.id}>
                        <div>
                          <h3>{e.title}</h3>
                          <p className="ws-small ws-muted">
                            {dateLabel(e.date)}
                          </p>
                        </div>
                        <Badge tone="warning">Due</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No upcoming deadlines"
                    description="New work will appear here when your instructor assigns it."
                  />
                )}
              </Panel>
            </div>
            <Panel
              title="Study tools"
              description="Build understanding, practise recall and keep your notes organised."
            >
              {tools}
            </Panel>
            <div className="ws-grid">
              <Panel
                title="Today’s study goal"
                description="A simple target of four lessons per day."
              >
                <div className="flex items-end justify-between mb-5">
                  <strong className="text-3xl font-semibold">
                    {stats.lessonsToday}
                    <span className="text-base ws-muted"> / 4 lessons</span>
                  </strong>
                  <Badge>{stats.streak} day streak</Badge>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    Math.round((stats.lessonsToday / 4) * 100),
                  )}
                  label="Daily lesson goal"
                />
              </Panel>
              <Panel
                title="A little encouragement"
                action={
                  <button
                    className="ws-link"
                    aria-label="Show another study quote"
                    onClick={() => setQuote((quote + 1) % quotes.length)}
                  >
                    <RefreshCw size={15} />
                  </button>
                }
              >
                <p className="ws-description mb-4">“{quotes[quote]}”</p>
                <button
                  className="ws-link"
                  aria-pressed={liked}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart size={15} fill={liked ? "currentColor" : "none"} />
                  {liked ? "Saved for this visit" : "Save inspiration"}
                </button>
              </Panel>
            </div>
          </>
        )}
        {tab === "courses" && (
          <Panel
            title="Your enrolled courses"
            description="Classroom codes, completion and access in one list."
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
                <span className="sr-only">Course completion filter</span>
                <select
                  className="ws-input"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All courses</option>
                  <option value="active">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
            </div>
            {enrollments.filter(
              (e) =>
                e.course.title.toLowerCase().includes(search.toLowerCase()) &&
                (filter === "all" ||
                  (filter === "completed" ? e.isCompleted : !e.isCompleted)),
            ).length ? (
              courseRows(
                enrollments.filter(
                  (e) =>
                    e.course.title
                      .toLowerCase()
                      .includes(search.toLowerCase()) &&
                    (filter === "all" ||
                      (filter === "completed"
                        ? e.isCompleted
                        : !e.isCompleted)),
                ),
              )
            ) : (
              <EmptyState
                title="No matching courses"
                description="Try another search or enroll in a free course."
              />
            )}
          </Panel>
        )}
        {tab === "tools" && (
          <>
            {tools}
            <Panel title="Your private study library">
              <div className="ws-metrics">
                <Metric label="Saved flashcards" value={stats.flashcards} />
                <Metric label="Cards due" value={stats.flashcardsDue} />
                <Metric label="Reviewed today" value={stats.reviewedToday} />
                <Metric
                  label="Completed assessments"
                  value={stats.assessmentCount}
                />
              </div>
              <p className="ws-note mt-5">
                Use the floating assistant in the corner for help in your
                language. AI study tools clearly identify offline templates when
                a live model is unavailable. Review important answers.
              </p>
            </Panel>
          </>
        )}
        {tab === "assignments" && (
          <Panel
            title="Course assignments"
            description={`${pending.length} awaiting your submission. Only your own responses and grades are shown.`}
          >
            {assignments.length ? (
              <div className="ws-table-wrap">
                <table className="ws-table">
                  <caption className="sr-only">
                    Assignments and your submissions
                  </caption>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Due date</th>
                      <th>Your status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a._id}>
                        <td>
                          <h3>{a.title}</h3>
                          <p className="ws-small ws-muted">{a.course?.title}</p>
                        </td>
                        <td>{dateLabel(a.dueDate)}</td>
                        <td>
                          <Badge
                            tone={a.submissions.length ? "success" : "warning"}
                          >
                            {a.submissions[0]?.score !== undefined
                              ? `${a.submissions[0].score}/${a.maxScore}`
                              : a.submissions.length
                                ? "Awaiting review"
                                : "Not submitted"}
                          </Badge>
                        </td>
                        <td>
                          <button
                            className="ws-link"
                            onClick={() => setAssignment(a._id)}
                          >
                            {a.submissions.length
                              ? "View submission"
                              : "Open assignment"}
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No assignments yet"
                description="Assignments from your enrolled, published courses will appear here."
              />
            )}
          </Panel>
        )}
        {tab === "quizzes" && (
          <>
            <Panel
              title="Classroom quizzes"
              description="Your instructor’s saved quizzes, with server-managed timers and attempt limits."
              action={
                <Link
                  href="/dashboard/student/revision-quiz"
                  className="ws-link"
                >
                  Practice a topic
                  <ArrowRight size={14} />
                </Link>
              }
            >
              {quizzes.length ? (
                <div className="ws-list">
                  {quizzes.map((q) => (
                    <div className="ws-list-item" key={q._id}>
                      <div>
                        <h3>{q.title}</h3>
                        <p className="ws-small ws-muted">
                          {q.course?.title} · {q.timeLimit} minutes ·{" "}
                          {dateLabel(q.dueDate)}
                        </p>
                        {q.generationMode === "offline" && (
                          <Badge>Offline template</Badge>
                        )}
                      </div>
                      <Link
                        className="ws-button ws-secondary"
                        href={`/courses/${q.course._id}/quiz/${q._id}`}
                      >
                        Open quiz
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No classroom quizzes yet"
                  description="You can still use revision quizzes for self-directed practice."
                />
              )}
            </Panel>
            <Panel
              title="Assessment history"
              description="Actual submitted assessments for this account."
            >
              {attempts.length ? (
                <div className="ws-list">
                  {attempts.map((a) => (
                    <div className="ws-list-item" key={a._id}>
                      <div>
                        <h3>{a.quiz?.title || "Archived quiz"}</h3>
                        <p className="ws-small ws-muted">
                          {dateLabel(a.updatedAt)}
                        </p>
                      </div>
                      <Badge>{a.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ws-note">
                  No submitted assessments yet. Complete your course lessons to
                  unlock its certification assessment.
                </p>
              )}
            </Panel>
          </>
        )}
        {tab === "certificates" && (
          <Panel
            title="Earned course-completion certificates"
            description="Certificates are issued by this project after a passed course assessment."
          >
            {certificates.length ? (
              <div className="ws-grid">
                {certificates.map((c) => (
                  <article className="ws-tool" key={c._id}>
                    <Award className="ws-tool-icon" size={42} />
                    <div>
                      <h3>{c.courseTitle}</h3>
                      <p>Completed {dateLabel(c.completedAt)}</p>
                      <Link
                        className="ws-link mt-3"
                        href={`/certificates/${c.certificateId}`}
                      >
                        View & download
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Your first certificate is ahead"
                description="Complete every lecture and pass the course assessment to earn a completion certificate."
                action={
                  <Link
                    href="/dashboard/student?tab=courses"
                    className="ws-button"
                  >
                    View my courses
                  </Link>
                }
              />
            )}
          </Panel>
        )}
        {tab === "progress" && (
          <>
            {metrics}
            <div className="ws-grid">
              <Panel title="Learning progress">
                <Metric
                  label="Average course progress"
                  value={`${stats.averageProgress}%`}
                  hint="Across your enrolled courses"
                  icon={<BarChart3 size={18} />}
                />
                <div className="ws-list mt-4">
                  {enrollments.map((e) => (
                    <div key={e._id} className="ws-list-item">
                      <div className="w-full">
                        <h3 className="mb-3">{e.course.title}</h3>
                        <Progress
                          value={e.progressPercentage}
                          label={e.course.title + " progress"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Practice & consistency">
                <div className="ws-list">
                  <div className="ws-list-item">
                    <span>Lessons today</span>
                    <strong>{stats.lessonsToday}</strong>
                  </div>
                  <div className="ws-list-item">
                    <span>Current study streak</span>
                    <strong>{stats.streak} days</strong>
                  </div>
                  <div className="ws-list-item">
                    <span>Completed assessments</span>
                    <strong>{stats.assessmentCount}</strong>
                  </div>
                  <div className="ws-list-item">
                    <span>Cards reviewed today</span>
                    <strong>{stats.reviewedToday}</strong>
                  </div>
                </div>
                <p className="ws-note mt-6">
                  Course progress reaches 100% after the lectures. A certificate
                  additionally requires a passing assessment.
                </p>
              </Panel>
            </div>
          </>
        )}
      </div>
      {join && (
        <JoinBatchModal
          isOpen={join}
          onClose={() => setJoin(false)}
          onJoined={() => {
            void mutate();
          }}
        />
      )}
      {assignment && (
        <AssignmentDialog
          id={assignment}
          onClose={() => setAssignment(undefined)}
          onSubmitted={() => void mutate()}
        />
      )}{" "}
      {calendar && (
        <StudyCalendar events={events} onClose={() => setCalendar(false)} />
      )}
    </>
  );
}
