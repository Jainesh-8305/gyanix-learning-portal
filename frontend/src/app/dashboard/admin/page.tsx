'use client';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Users,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowRight,
  ShieldCheck,
  CircleHelp,
} from 'lucide-react';
import {
  PageHeading,
  Panel,
  Metric,
  LoadingState,
  ErrorState,
  QuickLink,
  Badge,
} from '@/components/workspace/ui';
interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  pendingCourses: number;
}
export default function AdminDashboard() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Stats }>(
    '/admin/dashboard',
  );
  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState retry={() => void mutate()} />;
  const stats = data.data;
  return (
    <>
      <PageHeading
        mascot="admin"
        eyebrow="Academy control center"
        title="Platform overview"
        description="Manage people, review course submissions and keep learning accessible."
        actions={
          <Link
            href="/dashboard/admin/courses?status=pending"
            className="ws-button"
          >
            <Clock size={16} />
            Review submissions
          </Link>
        }
      />
      <div className="ws-stack">
        <div className="ws-metrics">
          <Metric
            label="Registered users"
            value={stats.totalUsers}
            hint="Student, instructor and admin accounts"
            icon={<Users size={17} />}
          />
          <Metric
            label="Published courses"
            value={stats.totalCourses}
            hint="Available to students for free"
            icon={<BookOpen size={17} />}
          />
          <Metric
            label="Total enrollments"
            value={stats.totalEnrollments}
            hint="Learning records across the platform"
            icon={<ClipboardList size={17} />}
          />
          <Metric
            label="Pending review"
            value={stats.pendingCourses}
            hint="Instructor submissions awaiting a decision"
            icon={<Clock size={17} />}
          />
        </div>
        <div className="ws-columns">
          <Panel
            title="Course review queue"
            description="Make sure each curriculum is ready before publication."
            action={
              <Badge tone={stats.pendingCourses ? 'warning' : 'success'}>
                {stats.pendingCourses ? 'Action needed' : 'Up to date'}
              </Badge>
            }
          >
            <div className="flex items-center gap-5 my-7">
              <span className="ws-empty-icon">
                <ShieldCheck size={26} />
              </span>
              <div>
                <strong className="text-3xl font-semibold">
                  {stats.pendingCourses}
                </strong>
                <p className="ws-small ws-muted mt-2">
                  courses awaiting administrator review
                </p>
              </div>
            </div>
            <p className="ws-description ws-muted mb-6">
              Preview the curriculum, approve a complete submission, request
              specific changes or manage its visibility. Archiving preserves
              learning records.
            </p>
            <Link
              className="ws-button"
              href="/dashboard/admin/courses?status=pending"
            >
              Open review queue
              <ArrowRight size={15} />
            </Link>
          </Panel>
          <Panel
            title="Platform access"
            description="Clear responsibilities and controlled permissions."
          >
            <div className="ws-list">
              <div className="ws-list-item">
                <span>Course enrollment</span>
                <Badge tone="success">Free</Badge>
              </div>
              <div className="ws-list-item">
                <span>Course publication</span>
                <span className="ws-small ws-muted">Admin approval</span>
              </div>
              <div className="ws-list-item">
                <span>Private learning data</span>
                <span className="ws-small ws-muted">
                  Role & ownership checks
                </span>
              </div>
            </div>
            <p className="ws-note mt-6">
              The assistant provides read-only help and authorized summaries. It
              cannot change permissions or perform administrator actions.
            </p>
          </Panel>
        </div>
        <div className="ws-grid">
          <QuickLink
            href="/dashboard/admin/courses"
            title="Course governance"
            description="Review, publish, request changes, hide or archive courses."
            icon={<BookOpen size={21} />}
          />
          <QuickLink
            href="/dashboard/admin/users"
            title="User management"
            description="Find accounts and manage the active status of non-admin users."
            icon={<Users size={21} />}
          />
          <QuickLink
            href="/dashboard/admin/enrollments"
            title="Enrollment records"
            description="Inspect course membership, progress and enrollment dates."
            icon={<ClipboardList size={21} />}
          />
          <QuickLink
            href="/help"
            title="Administrator documentation"
            description="Reference the moderation, privacy and account-management workflows."
            icon={<CircleHelp size={21} />}
          />
        </div>
      </div>
    </>
  );
}
