// frontend/src/components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:   'gradient-btn text-white shadow-lg shadow-indigo-500/25 border-transparent',
  teal:      'gradient-btn-teal text-white shadow-lg shadow-teal-500/20 border-transparent',
  secondary: 'bg-white/5 hover:bg-white/10 text-indigo-200/80 hover:text-white border-[var(--border-default)] hover:border-[var(--border-strong)]',
  ghost:     'bg-transparent hover:bg-white/5 text-indigo-200/60 hover:text-white border-transparent',
  danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-400/40',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-[var(--radius-sm)]',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-[var(--radius-md)]',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-[var(--radius-lg)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium border transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 12 : size === 'lg' ? 18 : 15} className="animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
