import { Check, X } from 'lucide-react';
import type { Contribution, QuizQuestion } from '../../types';
import { cx } from '../../lib/utils';

export default function QuizResponseViewer({
  contributions,
  questions,
}: {
  contributions: Contribution[];
  questions: QuizQuestion[];
}) {
  if (contributions.length === 0) {
    return <p className="font-sans text-sm text-ink-soft">No quiz responses yet.</p>;
  }
  return (
    <div className="space-y-4">
      {contributions.map((c) => {
        const answers: number[] = c.content?.answers ?? [];
        return (
          <div key={c.id} className="rounded-xl border-2 border-ink bg-[#fffdf8] p-4 shadow-[var(--shadow-brutal-sm)]">
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm font-bold text-ink">
                {c.contributor_name}
                {c.contributor_relationship ? <span className="font-normal text-ink-soft"> · {c.contributor_relationship}</span> : null}
              </p>
              <p className="font-display text-lg font-bold">
                {c.score ?? 0}
                <span className="text-sm font-normal text-ink-soft">/{questions.length}</span>
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {questions.map((q, qi) => {
                const given = answers[qi];
                const correct = given === q.correctIndex;
                return (
                  <div key={qi} className="flex items-start gap-2 text-sm">
                    {correct ? (
                      <Check size={16} className="mt-0.5 shrink-0 text-mint-deep" />
                    ) : (
                      <X size={16} className="mt-0.5 shrink-0 text-pink-deep" />
                    )}
                    <p className="text-ink-soft">
                      <span className="text-ink">{q.text || `Question ${qi + 1}`}</span> — answered{' '}
                      <span className={cx('font-semibold', correct ? 'text-mint-deep' : 'text-pink-deep')}>
                        {q.options[given] ?? '—'}
                      </span>
                      {!correct && <span> (correct: {q.options[q.correctIndex]})</span>}
                    </p>
                  </div>
                );
              })}
            </div>
            {c.content?.questionForCelebrant && (
              <p className="mt-3 rounded-lg bg-lavender/40 p-2.5 font-display text-sm italic text-ink">
                “{c.content.questionForCelebrant}”
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
