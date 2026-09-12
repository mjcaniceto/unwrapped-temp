import { Plus, Trash2 } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import { Input } from '../primitives/Field';
import Button from '../primitives/Button';
import { cx } from '../../lib/utils';

interface QuizEditorProps {
  questions: QuizQuestion[];
  askQuestionToCelebrant: boolean;
  onChange: (questions: QuizQuestion[]) => void;
  onToggleAsk: (v: boolean) => void;
}

export default function QuizEditor({ questions, askQuestionToCelebrant, onChange, onToggleAsk }: QuizEditorProps) {
  function updateQuestion(i: number, patch: Partial<QuizQuestion>) {
    onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function updateOption(qi: number, oi: number, value: string) {
    const q = questions[qi];
    const options = q.options.map((o, idx) => (idx === oi ? value : o));
    updateQuestion(qi, { options });
  }
  function addOption(qi: number) {
    const q = questions[qi];
    if (q.options.length >= 4) return;
    updateQuestion(qi, { options: [...q.options, ''] });
  }
  function removeOption(qi: number, oi: number) {
    const q = questions[qi];
    if (q.options.length <= 2) return;
    const options = q.options.filter((_, idx) => idx !== oi);
    const correctIndex = q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex;
    updateQuestion(qi, { options, correctIndex });
  }
  function addQuestion() {
    onChange([...questions, { text: '', options: ['', ''], correctIndex: 0 }]);
  }
  function removeQuestion(i: number) {
    onChange(questions.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-2xl border-2 border-ink bg-[#fffdf8] p-4 shadow-[var(--shadow-brutal-sm)]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">Question {qi + 1}</p>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qi)}
                className="text-ink-soft hover:text-pink-deep"
                aria-label="Remove question"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <Input
            placeholder="e.g. What's their go-to karaoke song?"
            value={q.text}
            onChange={(e) => updateQuestion(qi, { text: e.target.value })}
          />
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuestion(qi, { correctIndex: oi })}
                  className={cx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-xs font-bold transition',
                    q.correctIndex === oi ? 'bg-mint' : 'bg-white'
                  )}
                  title="Mark as correct answer"
                >
                  {q.correctIndex === oi ? '✓' : String.fromCharCode(65 + oi)}
                </button>
                <Input
                  placeholder={`Option ${oi + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                  className="py-2"
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qi, oi)}
                    className="shrink-0 text-ink-soft hover:text-pink-deep"
                    aria-label="Remove option"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {q.options.length < 4 && (
              <button
                type="button"
                onClick={() => addOption(qi)}
                className="ml-10 text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-ink"
              >
                + Add option
              </button>
            )}
          </div>
          <p className="ml-10 mt-1 text-[11px] text-ink-soft">Tap the circle to mark the correct answer.</p>
        </div>
      ))}

      <Button type="button" variant="secondary" icon={<Plus size={16} />} onClick={addQuestion}>
        Add question
      </Button>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-ink bg-lavender/40 p-4 shadow-[var(--shadow-brutal-sm)]">
        <input
          type="checkbox"
          checked={askQuestionToCelebrant}
          onChange={(e) => onToggleAsk(e.target.checked)}
          className="h-5 w-5 accent-ink"
        />
        <span className="font-sans text-sm font-semibold">
          Let each contributor leave an optional question for the celebrant at the end
        </span>
      </label>
    </div>
  );
}
