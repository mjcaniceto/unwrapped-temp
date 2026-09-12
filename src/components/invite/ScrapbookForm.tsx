import { Textarea } from '../primitives/Field';
import MultiImageUpload from '../uploads/MultiImageUpload';

export interface ScrapbookValue {
  images: string[];
  description: string;
}

export default function ScrapbookForm({
  surpriseId,
  value,
  onChange,
}: {
  surpriseId: string;
  value: ScrapbookValue;
  onChange: (v: ScrapbookValue) => void;
}) {
  return (
    <div className="space-y-4">
      <MultiImageUpload surpriseId={surpriseId} images={value.images} onChange={(images) => onChange({ ...value, images })} />
      <Textarea
        rows={3}
        placeholder="A caption for this page…"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
    </div>
  );
}
