import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cx } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANTS: Record<string, string> = {
  primary: 'bg-ink text-paper border-ink',
  secondary: 'bg-yellow text-ink border-ink',
  ghost: 'bg-transparent text-ink border-ink',
  danger: 'bg-pink text-ink border-ink',
};

export default function Button({
  children,
  variant = 'primary',
  loading,
  icon,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        'brutal-btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-sans text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        className
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
