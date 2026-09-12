import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cx } from '../../lib/utils';

const STEP_LABELS = ['Celebrant', 'Theme', 'Sections', 'Configure', 'Blueprint'];

export function WizardProgress({ step }: { step: number }) {
  return (
    <div className="mx-auto mb-10 flex max-w-xl items-center justify-between">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink font-sans text-xs font-bold transition',
                active && 'bg-yellow shadow-[var(--shadow-brutal-sm)]',
                done && 'bg-mint',
                !active && !done && 'bg-white text-ink-soft'
              )}
            >
              {done ? '✓' : n}
            </div>
            <span
              className={cx(
                'mt-1.5 hidden font-sans text-[10px] font-bold uppercase tracking-wider sm:block',
                active ? 'text-ink' : 'text-ink-soft/70'
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function WizardStep({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

export function StepTitle({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <span className="text-4xl">{emoji}</span>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 font-sans text-sm text-ink-soft">{subtitle}</p>}
    </div>
  );
}
