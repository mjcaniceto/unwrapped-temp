import { useState } from 'react';
import type { QuizQuestion } from '../../types';
import { Textarea } from '../primitives/Field';
import { cx } from '../../lib/utils';

interface QuizFormProps {
  questions: QuizQuestion[];
  askQuestionToCelebrant?: boolean;
  onSubmit: (answers: number[], questionForCelebrant: string | null) => void;
  celebrantName: string;
}

export default function QuizForm({ questions, askQuestionToCelebrant, onSubmit, celebrantName }: QuizFormProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [question, setQuestion] = useState('');

  const complete = answers.every((a) => a !== null);

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-2xl border-2 border-ink bg-[#fffdf8] p-4 shadow-[var(--shadow-brutal-sm)]">
          <p className="mb-3 font-display text-lg font-semibold text-ink">
            {qi + 1}. {q.text || 'Untitled question'}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                onClick={() => setAnswers((a) => a.map((v, idx) => (idx === qi ? oi : v)))}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl border-2 border-ink px-4 py-3 text-left font-sans text-sm font-medium transition',
                  answers[qi] === oi ? 'bg-mint shadow-[var(--shadow-brutal-sm)]' : 'bg-white hover:bg-paper-dark'
                )}
              >
                <span
                  className={cx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink text-[11px] font-bold',
                    answers[qi] === oi && 'bg-ink text-paper'
                  )}
                >
                  {String.fromCharCode(65 + oi)}
                </span>
                {opt || `Option ${oi + 1}`}
              </button>
            ))}
          </div>
        </div>
      ))}

      {askQuestionToCelebrant && (
        <div>
          <p className="mb-1.5 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
            Optional — ask {celebrantName} something
          </p>
          <Textarea
            rows={2}
            placeholder="Anything you've always wanted to ask them?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
      )}

      <button
        type="button"
        disabled={!complete}
        onClick={() => onSubmit(answers as number[], question.trim() || null)}
        className="brutal-btn w-full rounded-xl bg-ink px-5 py-3 font-sans text-sm font-bold text-paper disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit answers
      </button>
    </div>
  );
}
