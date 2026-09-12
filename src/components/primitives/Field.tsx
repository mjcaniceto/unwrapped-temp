import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/utils';

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
      {children}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={cx(
        'w-full rounded-xl border-2 border-ink bg-[#fffdf8] px-4 py-3 font-sans text-base text-ink placeholder:text-ink-soft/50 shadow-[var(--shadow-brutal-sm)] outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition',
        className
      )}
    />
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={cx(
        'w-full rounded-xl border-2 border-ink bg-[#fffdf8] px-4 py-3 font-sans text-base text-ink placeholder:text-ink-soft/50 shadow-[var(--shadow-brutal-sm)] outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition resize-none',
        className
      )}
    />
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-semibold text-pink-deep">{children}</p>;
}
