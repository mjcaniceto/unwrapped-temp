import type { CSSProperties } from 'react';
import { cx } from '../../lib/utils';

const COLORS: Record<string, string> = {
  yellow: 'bg-yellow-deep/70',
  pink: 'bg-pink-deep/70',
  mint: 'bg-mint-deep/70',
  sky: 'bg-sky-deep/70',
  peach: 'bg-peach-deep/70',
  lavender: 'bg-lavender-deep/70',
};

interface WashiTapeProps {
  color?: keyof typeof COLORS;
  rotate?: number;
  className?: string;
  width?: number;
}

export default function WashiTape({ color = 'yellow', rotate = -3, className, width = 90 }: WashiTapeProps) {
  const style: CSSProperties = { transform: `rotate(${rotate}deg)`, width };
  return (
    <span
      style={style}
      className={cx('washi absolute h-6 border border-ink/40', COLORS[color], className)}
      aria-hidden
    />
  );
}
