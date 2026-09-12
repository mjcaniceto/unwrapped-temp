import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../lib/utils';

const FILL: Record<string, string> = {
  yellow: 'bg-yellow',
  pink: 'bg-pink',
  mint: 'bg-mint',
  sky: 'bg-sky',
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  paper: 'bg-paper',
  white: 'bg-[#fffdf8]',
};

interface PaperCardProps {
  children: ReactNode;
  color?: keyof typeof FILL;
  rotate?: number;
  className?: string;
  as?: 'div' | 'article';
  shadow?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function PaperCard({
  children,
  color = 'white',
  rotate = 0,
  className,
  shadow = 'md',
  onClick,
}: PaperCardProps) {
  const shadowClass =
    shadow === 'sm' ? 'shadow-[var(--shadow-brutal-sm)]' : shadow === 'lg' ? 'shadow-[var(--shadow-brutal-lg)]' : 'shadow-[var(--shadow-brutal)]';
  const style: CSSProperties = { transform: `rotate(${rotate}deg)` };
  return (
    <div
      onClick={onClick}
      style={style}
      className={cx(
        'rounded-2xl border-2 border-ink',
        FILL[color],
        shadowClass,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
