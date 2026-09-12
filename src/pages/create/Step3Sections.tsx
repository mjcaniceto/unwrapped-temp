import type { SectionConfig } from '../../types';
import { SECTION_META } from '../../types';
import { cx } from '../../lib/utils';
import { StepTitle } from './WizardShell';

export default function Step3Sections({
  sections,
  onChange,
}: {
  sections: SectionConfig[];
  onChange: (s: SectionConfig[]) => void;
}) {
  function toggle(type: string) {
    onChange(sections.map((s) => (s.type === type ? { ...s, enabled: !s.enabled } : s)));
  }

  return (
    <div>
      <StepTitle emoji="🧩" title="Choose your chapters" subtitle="Gift/Voucher is optional — turn on whatever fits." />
      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const meta = SECTION_META[s.type];
          return (
            <button
              key={s.type}
              type="button"
              onClick={() => toggle(s.type)}
              className={cx(
                'flex items-start gap-3 rounded-2xl border-2 border-ink p-4 text-left shadow-[var(--shadow-brutal-sm)] transition',
                s.enabled ? 'bg-mint/50' : 'bg-white opacity-60'
              )}
            >
              <span className="text-2xl">{meta.emoji}</span>
              <span className="flex-1">
                <span className="block font-display text-lg font-bold text-ink">{meta.label}</span>
                <span className="block font-sans text-xs text-ink-soft">{meta.blurb}</span>
              </span>
              <span
                className={cx(
                  'mt-1 flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-ink px-0.5 transition',
                  s.enabled ? 'justify-end bg-yellow' : 'justify-start bg-white'
                )}
              >
                <span className="h-4 w-4 rounded-full bg-ink" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
