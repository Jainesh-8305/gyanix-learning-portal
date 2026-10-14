// frontend/src/components/ui/SkeletonLoader.tsx
// Reusable content placeholder skeletons — shown while SWR/API data loads.
// Usage: <CourseSkeleton /> <DashboardStatsSkeleton /> <LessonSkeleton />

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ── Course card skeleton (used in course grid) ─────────────────
export function CourseCardSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-xl)] overflow-hidden animate-fade-in">
      <SkeletonBox className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-3.5 w-full" />
        <SkeletonBox className="h-3.5 w-2/3" />
        <div className="flex justify-between pt-1">
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Dashboard stat card skeleton ────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-xl)] p-5 animate-fade-in">
      <SkeletonBox className="h-10 w-10 rounded-xl mb-4" />
      <SkeletonBox className="h-8 w-16 mb-2" />
      <SkeletonBox className="h-3.5 w-28" />
    </div>
  );
}

// ── Table row skeleton ─────────────────────────────────────────
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--border-subtle)] animate-fade-in">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox key={i} className={`h-4 ${i === 0 ? 'flex-1' : 'w-24'}`} />
      ))}
    </div>
  );
}

// ── Lesson list skeleton (learn page sidebar) ────────────────
export function LessonSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-2 py-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <SkeletonBox className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
          <SkeletonBox className={`h-3.5 ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-3/4' : 'w-5/6'}`} />
        </div>
      ))}
    </div>
  );
}

// ── Quiz question skeleton ─────────────────────────────────────
export function QuizSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <SkeletonBox className="h-6 w-2/3" />
      <SkeletonBox className="h-4 w-full" />
      <div className="space-y-3 mt-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 glass rounded-[var(--radius-lg)]">
            <SkeletonBox className="h-4 w-4 rounded-full shrink-0" />
            <SkeletonBox className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
