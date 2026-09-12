import type { CSSProperties } from 'react';
import { cx } from '../../lib/utils';

interface PolaroidProps {
  src: string;
  caption?: string;
  rotate?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES: Record<string, string> = {
  sm: 'w-24',
  md: 'w-40',
  lg: 'w-56',
};

export default function Polaroid({ src, caption, rotate = -4, className, size = 'md' }: PolaroidProps) {
  const style: CSSProperties = { transform: `rotate(${rotate}deg)` };
  return (
    <figure
      style={style}
      className={cx(
        'bg-[#fffdf8] border-2 border-ink shadow-[var(--shadow-brutal)] p-2 pb-4 rounded-[2px]',
        SIZES[size],
        className
      )}
    >
      <div className="aspect-square w-full overflow-hidden rounded-[1px] bg-paper-dark">
        <img src={src} alt={caption ?? ''} className="h-full w-full object-cover" loading="lazy" />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center font-hand text-lg leading-none text-ink-soft">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
