import { SECTION_META, type SectionConfig } from '../../types';
import { Input, Label, Textarea } from '../../components/primitives/Field';
import QuizEditor from '../../components/quiz/QuizEditor';
import { StepTitle } from './WizardShell';
import { X, ImagePlus, FileVideo } from 'lucide-react';
import { useRef } from 'react';

export interface FinalRevealDraft {
  title: string;
  message: string;
  image_file: File | null;
  image_preview: string | null;
  video_file: File | null;
  video_preview: string | null;
  external_url: string;
}

interface Props {
  sections: SectionConfig[];
  onChange: (s: SectionConfig[]) => void;
  finalReveal: FinalRevealDraft;
  onFinalRevealChange: (f: FinalRevealDraft) => void;
}

export default function Step4Configure({ sections, onChange, finalReveal, onFinalRevealChange }: Props) {
  const enabled = sections.filter((s) => s.enabled);
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);

  function updateSection(type: string, patch: Partial<SectionConfig>) {
    onChange(sections.map((s) => (s.type === type ? { ...s, ...patch } : s)));
  }

  return (
    <div>
      <StepTitle emoji="✏️" title="Make it yours" subtitle="Set a title and prompt for each chapter." />

      <div className="mx-auto max-w-2xl space-y-6">
        {enabled.map((s) => {
          const meta = SECTION_META[s.type];
          return (
            <div key={s.type} className="rounded-2xl border-2 border-ink bg-[#fffdf8] p-5 shadow-[var(--shadow-brutal-sm)]">
              <p className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
                <span>{meta.emoji}</span> {meta.label}
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`title-${s.type}`}>Section title</Label>
                  <Input
                    id={`title-${s.type}`}
                    value={s.title}
                    onChange={(e) => updateSection(s.type, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`prompt-${s.type}`}>Prompt shown to contributors</Label>
                  <Textarea
                    id={`prompt-${s.type}`}
                    rows={2}
                    value={s.prompt}
                    onChange={(e) => updateSection(s.type, { prompt: e.target.value })}
                  />
                </div>
                {s.type === 'gift_voucher' && (
                  <div className="max-w-[140px]">
                    <Label htmlFor="maxPer">Max per contributor</Label>
                    <Input
                      id="maxPer"
                      type="number"
                      min={1}
                      max={10}
                      value={s.maxPerContributor ?? 3}
                      onChange={(e) => updateSection(s.type, { maxPerContributor: Number(e.target.value) || 1 })}
                    />
                  </div>
                )}
                {s.type === 'quiz' && (
                  <QuizEditor
                    questions={s.questions ?? []}
                    askQuestionToCelebrant={s.askQuestionToCelebrant ?? true}
                    onChange={(questions) => updateSection(s.type, { questions })}
                    onToggleAsk={(v) => updateSection(s.type, { askQuestionToCelebrant: v })}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Final Reveal */}
        <div className="rounded-2xl border-2 border-ink bg-yellow/30 p-5 shadow-[var(--shadow-brutal-sm)]">
          <p className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
            <span>🎉</span> Final Reveal
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="reveal-title">Title</Label>
              <Input
                id="reveal-title"
                placeholder="e.g. Happy 30th, Alex!"
                value={finalReveal.title}
                onChange={(e) => onFinalRevealChange({ ...finalReveal, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reveal-message">Closing message</Label>
              <Textarea
                id="reveal-message"
                rows={3}
                placeholder="The last words they'll read before the confetti."
                value={finalReveal.message}
                onChange={(e) => onFinalRevealChange({ ...finalReveal, message: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reveal-link">External link (optional)</Label>
              <Input
                id="reveal-link"
                placeholder="https://…"
                value={finalReveal.external_url}
                onChange={(e) => onFinalRevealChange({ ...finalReveal, external_url: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <Label>Image (optional)</Label>
                {finalReveal.image_preview ? (
                  <div className="relative inline-block">
                    <img src={finalReveal.image_preview} alt="" className="h-20 w-20 rounded-xl border-2 border-ink object-cover" />
                    <button
                      type="button"
                      onClick={() => onFinalRevealChange({ ...finalReveal, image_file: null, image_preview: null })}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-pink"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imgInput.current?.click()}
                    className="brutal-btn flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl bg-white text-ink-soft"
                  >
                    <ImagePlus size={18} />
                    <span className="text-[10px] font-bold">Add</span>
                  </button>
                )}
                <input
                  ref={imgInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFinalRevealChange({ ...finalReveal, image_file: f, image_preview: URL.createObjectURL(f) });
                    e.target.value = '';
                  }}
                />
              </div>
              <div>
                <Label>Video (optional)</Label>
                {finalReveal.video_preview ? (
                  <div className="relative inline-block">
                    <video src={finalReveal.video_preview} className="h-20 w-20 rounded-xl border-2 border-ink object-cover" />
                    <button
                      type="button"
                      onClick={() => onFinalRevealChange({ ...finalReveal, video_file: null, video_preview: null })}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-pink"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => vidInput.current?.click()}
                    className="brutal-btn flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl bg-white text-ink-soft"
                  >
                    <FileVideo size={18} />
                    <span className="text-[10px] font-bold">Add</span>
                  </button>
                )}
                <input
                  ref={vidInput}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFinalRevealChange({ ...finalReveal, video_file: f, video_preview: URL.createObjectURL(f) });
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
