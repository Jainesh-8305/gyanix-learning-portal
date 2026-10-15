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
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingState } from '@/components/workspace/ui';
const items = {
  student: [
    ['Overview', 'overview', LayoutDashboard],
    ['My courses', 'courses', BookOpen],
    ['Study tools', 'tools', Library],
    ['Assignments', 'assignments', ClipboardList],
    ['Quizzes', 'quizzes', Brain],
    ['Certificates', 'certificates', Award],
    ['My progress', 'progress', ChartNoAxesCombined],
  ],
  instructor: [
    ['Overview', 'overview', LayoutDashboard],
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
  const role = useAuthStore((s) => s.user?.role) || 'student';
  const path = usePathname(),
    params = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const base = `/dashboard/${role}`;
  return (
    <div className="workspace">
      <a className="ws-skip" href="#workspace-content">
        Skip to workspace
      </a>
      <aside className="ws-sidebar">
        <div className="ws-sidebar-label">
          <ShieldCheck size={17} />
          <span>{role} workspace</span>
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
          <Link href="/courses" className="ws-nav-item">
            <BookOpen size={17} />
            Browse courses
            <ArrowUpRight size={14} />
          </Link>
          <Link href="/help" className="ws-nav-item">
            <CircleHelp size={17} />
            Help & documentation
          </Link>
          <p>
            Learn at your own pace.
            <br />
            Every published course is free.
          </p>
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
