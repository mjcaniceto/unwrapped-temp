import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionConfig, Theme } from '../../types';
import { SECTION_META } from '../../types';
import { Input, Label, FieldError } from '../../components/primitives/Field';
import { StepTitle } from './WizardShell';
import type { CelebrantInfo } from './Step1Celebrant';

export interface Credentials {
  email: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  celebrant: CelebrantInfo;
  theme: Theme;
  sections: SectionConfig[];
  onReorder: (s: SectionConfig[]) => void;
  credentials: Credentials;
  onCredentialsChange: (c: Credentials) => void;
  errors: Partial<Record<keyof Credentials, string>>;
}

export default function Step5Blueprint({
  celebrant,
  theme,
  sections,
  onReorder,
  credentials,
  onCredentialsChange,
  errors,
}: Props) {
  const enabled = [...sections].filter((s) => s.enabled).sort((a, b) => a.position - b.position);

  function move(type: string, dir: -1 | 1) {
    const idx = enabled.findIndex((s) => s.type === type);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= enabled.length) return;
    const reordered = [...enabled];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    const withPositions = reordered.map((s, i) => ({ ...s, position: i }));
    const disabled = sections.filter((s) => !s.enabled);
    onReorder([...withPositions, ...disabled]);
  }

  return (
    <div>
      <StepTitle emoji="🗺️" title="The blueprint" subtitle="Reorder chapters, then save your access details." />

      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <p className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">Chapter order</p>
          <div className="space-y-2">
            {enabled.map((s, i) => (
              <div
                key={s.type}
                className="flex items-center gap-3 rounded-xl border-2 border-ink bg-[#fffdf8] px-4 py-3 shadow-[var(--shadow-brutal-sm)]"
              >
                <span className="text-lg">{SECTION_META[s.type].emoji}</span>
                <span className="flex-1 font-sans text-sm font-bold text-ink">{s.title}</span>
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(s.type, -1)}
                  className="text-ink-soft hover:text-ink disabled:opacity-20"
                  aria-label="Move up"
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  disabled={i === enabled.length - 1}
                  onClick={() => move(s.type, 1)}
                  className="text-ink-soft hover:text-ink disabled:opacity-20"
                  aria-label="Move down"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-ink bg-mint/30 p-4 shadow-[var(--shadow-brutal-sm)]">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">Review</p>
          <p className="mt-2 font-display text-lg font-bold text-ink">
            {celebrant.celebrant_name || 'Untitled surprise'}
            {celebrant.age ? `, turning ${celebrant.age}` : ''}
          </p>
          <p className="font-sans text-xs text-ink-soft capitalize">{theme} theme · {enabled.length} chapters</p>
        </div>

        <div>
          <p className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
            Your dashboard access
          </p>
          <p className="mb-4 font-sans text-xs text-ink-soft">
            You won't create a general account — just an email and a password for returning to
            <em> this </em>
            surprise's dashboard.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="creator_email">Your email</Label>
              <Input
                id="creator_email"
                type="email"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={(e) => onCredentialsChange({ ...credentials, email: e.target.value })}
              />
              <FieldError>{errors.email}</FieldError>
            </div>
            <div>
              <Label htmlFor="creator_password">Create a password</Label>
              <Input
                id="creator_password"
                type="password"
                placeholder="At least 6 characters"
                value={credentials.password}
                onChange={(e) => onCredentialsChange({ ...credentials, password: e.target.value })}
              />
              <FieldError>{errors.password}</FieldError>
            </div>
            <div>
              <Label htmlFor="creator_password_confirm">Confirm password</Label>
              <Input
                id="creator_password_confirm"
                type="password"
                placeholder="Type it again"
                value={credentials.confirmPassword}
                onChange={(e) => onCredentialsChange({ ...credentials, confirmPassword: e.target.value })}
              />
              <FieldError>{errors.confirmPassword}</FieldError>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
