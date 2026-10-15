'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  Brain,
  Award,
  ChartNoAxesCombined,
  Library,
  ShieldCheck,
  CircleHelp,
  ArrowUpRight,
  Files,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingState } from '@/components/workspace/ui';
const items = {
  student: [
    ['Home', 'overview', LayoutDashboard],
    ['My courses', 'courses', BookOpen],
    ['AI learning', 'tools', Library],
    ['Assignments', 'assignments', ClipboardList],
    ['Quizzes', 'quizzes', Brain],
    ['Certificates', 'certificates', Award],
    ['Analytics', 'progress', ChartNoAxesCombined],
  ],
  instructor: [
    ['Flight deck', 'overview', LayoutDashboard],
    ['Courses', '/dashboard/instructor/courses', BookOpen],
    ['Students', 'students', Users],
    ['Assignment studio', 'assignments', ClipboardList],
    ['Quizzes', 'quizzes', Brain],
    ['Resources', 'resources', Files],
    ['Reviews & analytics', 'reviews', ChartNoAxesCombined],
  ],
  admin: [
    ['Overview', '/dashboard/admin', LayoutDashboard],
    ['Course governance', '/dashboard/admin/courses', BookOpen],
    ['User management', '/dashboard/admin/users', Users],
    ['Enrollment records', '/dashboard/admin/enrollments', ClipboardList],
  ],
} as const;
function Workspace({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'student';
  const path = usePathname(),
    params = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const base = `/dashboard/${role}`;
  return (
    <div className="workspace" data-role={role}>
      <a className="ws-skip" href="#workspace-content">
        Skip to workspace
      </a>
      <aside className="ws-sidebar">
        <div className="space-profile">
          <div className="space-profile-avatar">
            {user?.name?.charAt(0) || 'G'}
          </div>
          <div className="min-w-0">
            <p className="space-profile-label">
              <ShieldCheck size={11} />
              {role === 'student'
                ? 'Scholar command'
                : role === 'instructor'
                  ? 'Flight command'
                  : 'Academy control'}
            </p>
            <h2 className="truncate">{user?.name || 'Gyanix Academy'}</h2>
            <p className="space-profile-role">{role} account</p>
          </div>
        </div>
        <nav aria-label={`${role} workspace navigation`}>
          {items[role].map(([label, target, Icon]) => {
            const href = target.startsWith('/')
              ? target
              : base + (target === 'overview' ? '' : `?tab=${target}`);
            const active = target.startsWith('/')
              ? target === base
                ? path === base
                : path.startsWith(target)
              : path === base && tab === target;
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`ws-nav-item ${active ? 'ws-nav-active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ws-sidebar-footer">
          <p className="space-tools-label">Quick tools</p>
          {role === 'student' && (
            <>
              <Link href="/dashboard/student/notes" className="ws-nav-item">
                <Files size={15} />
                Notes & resources
              </Link>
              <Link
                href="/dashboard/student/flashcards"
                className="ws-nav-item"
              >
                <Sparkles size={15} />
                Flashcards (SRS)
              </Link>
            </>
          )}
          <Link href="/courses" className="ws-nav-item">
            <BookOpen size={17} />
            Browse courses
            <ArrowUpRight size={14} />
          </Link>
          <Link href="/help" className="ws-nav-item">
            <CircleHelp size={17} />
            Help & documentation
          </Link>
          <div className="space-motivation">
            <div>
              <p>Small Steps, Big Dreams</p>
              <span>Every published course is free.</span>
            </div>
            <Rocket size={23} />
          </div>
        </div>
      </aside>
      <main id="workspace-content" className="ws-main">
        {children}
      </main>
    </div>
  );
}
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Workspace>{children}</Workspace>
    </Suspense>
  );
}
