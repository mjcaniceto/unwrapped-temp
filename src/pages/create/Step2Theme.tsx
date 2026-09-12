import type { Theme } from '../../types';
import { cx } from '../../lib/utils';
import { StepTitle } from './WizardShell';

const THEMES: Array<{ id: Theme; label: string; blurb: string; emoji: string; swatch: string[] }> = [
  { id: 'warm', label: 'Warm', blurb: 'Peach, cream, and soft terracotta.', emoji: '🕯️', swatch: ['bg-peach', 'bg-yellow', 'bg-paper-dark'] },
  { id: 'fun', label: 'Fun', blurb: 'Saturated pinks, blues, and yellows.', emoji: '🎈', swatch: ['bg-pink', 'bg-sky', 'bg-yellow'] },
  { id: 'nostalgic', label: 'Nostalgic', blurb: 'Muted sepia, mint, and lavender.', emoji: '📼', swatch: ['bg-lavender', 'bg-mint', 'bg-paper-dark'] },
];

export default function Step2Theme({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  return (
    <div>
      <StepTitle emoji="🎨" title="Pick a mood" subtitle="This colors the celebrant's final reveal page." />
      <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cx(
              'rounded-2xl border-2 border-ink bg-[#fffdf8] p-5 text-left shadow-[var(--shadow-brutal)] transition',
              value === t.id ? 'ring-4 ring-yellow-deep/60' : 'opacity-90 hover:opacity-100'
            )}
          >
            <span className="text-3xl">{t.emoji}</span>
            <h3 className="mt-2 font-display text-xl font-bold text-ink">{t.label}</h3>
            <p className="mt-1 font-sans text-xs text-ink-soft">{t.blurb}</p>
            <div className="mt-3 flex gap-1.5">
              {t.swatch.map((c, i) => (
                <span key={i} className={cx('h-5 w-5 rounded-full border border-ink/40', c)} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
