import Link from "next/link";
import { ArrowRight, BookOpen, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="ws-heading">
      <div>
        {eyebrow && <p className="ws-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="ws-muted">{description}</p>
      </div>
      {actions && <div className="ws-actions">{actions}</div>}
    </header>
  );
}
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ws-panel ${className}`}>
      {title && (
        <div className="ws-panel-heading">
          <div>
            <h2>{title}</h2>
            {description && <p className="ws-muted ws-small">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Metric({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="ws-metric">
      <div className="ws-metric-top">
        <span>{label}</span>
        {icon && <span className="ws-icon">{icon}</span>}
      </div>
      <strong>{value}</strong>
      {hint && <p>{hint}</p>}
    </div>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  return <span className={`ws-badge ws-badge-${tone}`}>{children}</span>;
}
export function Progress({
  value,
  label = "Progress",
}: {
  value: number;
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="ws-progress-wrap">
      <div
        className="ws-progress"
        role="progressbar"
        aria-label={label}
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${safe}%` }} />
      </div>
      <span className="ws-small">{safe}%</span>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="ws-empty">
      <span className="ws-empty-icon">
        <BookOpen size={23} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function LoadingState({
  label = "Loading your workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="ws-loading" role="status">
      <span className="ws-spinner" />
      {label}
    </div>
  );
}
export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="ws-error" role="alert">
      <p>We couldn’t load this information. Your saved work is safe.</p>
      <button className="ws-button ws-secondary" onClick={retry}>
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  );
}
export function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className="ws-tool">
      <span className="ws-tool-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowRight size={16} className="ws-muted" />
    </Link>
  );
}
export const dateLabel = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

export function ModalLoading() {
  return (
    <div className="ws-dialog-backdrop">
      <div className="ws-dialog" role="status" aria-live="polite">
        <LoadingState label="Opening tool…" />
      </div>
    </div>
  );
}
