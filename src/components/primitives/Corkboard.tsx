import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';

export default function Corkboard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'cork-texture relative rounded-3xl border-2 border-ink shadow-[var(--shadow-brutal-lg)] p-4 sm:p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
