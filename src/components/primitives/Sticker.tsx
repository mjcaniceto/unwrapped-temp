import type { CSSProperties } from 'react';
import { cx } from '../../lib/utils';

interface StickerProps {
  emoji: string;
  rotate?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const SIZES: Record<string, string> = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-8xl',
};

export default function Sticker({ emoji, rotate = 0, size = 'md', className, label }: StickerProps) {
  const style: CSSProperties = { transform: `rotate(${rotate}deg)` };
  if (label) {
    return (
      <span
        style={style}
        className={cx(
          'inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-yellow px-3 py-1 shadow-[var(--shadow-brutal-sm)] font-sans text-xs font-bold uppercase tracking-wider text-ink',
          className
        )}
      >
        <span aria-hidden>{emoji}</span>
        {label}
      </span>
    );
  }
  return (
    <span style={style} className={cx('inline-block select-none drop-shadow-sm', SIZES[size], className)} aria-hidden>
      {emoji}
    </span>
  );
}
