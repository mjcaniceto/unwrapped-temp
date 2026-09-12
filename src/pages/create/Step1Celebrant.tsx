import { Camera, X } from 'lucide-react';
import { Input, Label, Textarea } from '../../components/primitives/Field';
import { StepTitle } from './WizardShell';

export interface CelebrantInfo {
  celebrant_name: string;
  celebrant_photo_file: File | null;
  celebrant_photo_preview: string | null;
  birthday: string;
  age: string;
  description: string;
}

interface Props {
  value: CelebrantInfo;
  onChange: (v: CelebrantInfo) => void;
}

export default function Step1Celebrant({ value, onChange }: Props) {
  function handlePhoto(file: File | null) {
    if (!file) {
      onChange({ ...value, celebrant_photo_file: null, celebrant_photo_preview: null });
      return;
    }
    const preview = URL.createObjectURL(file);
    onChange({ ...value, celebrant_photo_file: file, celebrant_photo_preview: preview });
  }

  return (
    <div>
      <StepTitle emoji="🎂" title="Who's the surprise for?" subtitle="This is the person who'll open the final reveal." />

      <div className="mx-auto max-w-md space-y-5">
        <div className="flex justify-center">
          {value.celebrant_photo_preview ? (
            <div className="relative">
              <img
                src={value.celebrant_photo_preview}
                alt=""
                className="h-28 w-28 rounded-full border-2 border-ink object-cover shadow-[var(--shadow-brutal)]"
              />
              <button
                type="button"
                onClick={() => handlePhoto(null)}
                className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-pink shadow-[var(--shadow-brutal-sm)]"
                aria-label="Remove photo"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <label className="brutal-btn flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-full bg-paper-dark text-ink-soft">
              <Camera size={22} />
              <span className="text-[10px] font-bold">Add photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>

        <div>
          <Label htmlFor="celebrant_name">Celebrant's name</Label>
          <Input
            id="celebrant_name"
            placeholder="e.g. Alex"
            value={value.celebrant_name}
            onChange={(e) => onChange({ ...value, celebrant_name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={value.birthday}
              onChange={(e) => onChange({ ...value, birthday: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="age">Turning</Label>
            <Input
              id="age"
              type="number"
              min={0}
              placeholder="e.g. 30"
              value={value.age}
              onChange={(e) => onChange({ ...value, age: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">A line about them (optional)</Label>
          <Textarea
            id="description"
            rows={2}
            placeholder="e.g. Our resident trivia champion and plant parent."
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
