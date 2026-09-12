import { useState } from 'react';
import { Textarea } from '../primitives/Field';
import FileUpload from '../uploads/FileUpload';

export interface NoteWallValue {
  message: string;
  photo: string | null;
}

export default function NoteWallForm({
  surpriseId,
  value,
  onChange,
}: {
  surpriseId: string;
  value: NoteWallValue;
  onChange: (v: NoteWallValue) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Textarea
          rows={5}
          placeholder="Pin a message they'll want to keep forever…"
          value={value.message}
          onChange={(e) => onChange({ ...value, message: e.target.value })}
        />
      </div>
      <FileUpload surpriseId={surpriseId} value={value.photo} onChange={(photo) => onChange({ ...value, photo })} label="Add a photo (optional)" />
    </div>
  );
}

export function useNoteWallForm(): [NoteWallValue, (v: NoteWallValue) => void, () => void] {
  const [value, setValue] = useState<NoteWallValue>({ message: '', photo: null });
  return [value, setValue, () => setValue({ message: '', photo: null })];
}
