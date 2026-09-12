import { Textarea } from '../primitives/Field';

export interface WishValue {
  wish: string;
}

export default function WishForm({ value, onChange }: { value: WishValue; onChange: (v: WishValue) => void }) {
  return (
    <Textarea
      rows={5}
      placeholder="Write down a wish for their year ahead…"
      value={value.wish}
      onChange={(e) => onChange({ wish: e.target.value })}
    />
  );
}
