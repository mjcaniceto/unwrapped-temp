import { Textarea } from '../primitives/Field';
import MediaUpload from '../uploads/MediaUpload';

export interface MemoryLaneValue {
  media_url: string | null;
  media_type: 'image' | 'video' | '';
  description: string;
}

export default function MemoryLaneForm({
  surpriseId,
  value,
  onChange,
}: {
  surpriseId: string;
  value: MemoryLaneValue;
  onChange: (v: MemoryLaneValue) => void;
}) {
  return (
    <div className="space-y-4">
      <MediaUpload
        surpriseId={surpriseId}
        url={value.media_url}
        type={value.media_type}
        onChange={(media_url, media_type) => onChange({ ...value, media_url, media_type })}
      />
      <Textarea
        rows={4}
        placeholder="Tell the story behind it…"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
    </div>
  );
}
