import { Input, Label, Textarea } from '../primitives/Field';
import FileUpload from '../uploads/FileUpload';
import { cx } from '../../lib/utils';

export interface GiftVoucherValue {
  gift_type: 'Gift' | 'Voucher';
  item_name: string;
  description: string;
  photo: string | null;
}

export default function GiftVoucherForm({
  surpriseId,
  value,
  onChange,
}: {
  surpriseId: string;
  value: GiftVoucherValue;
  onChange: (v: GiftVoucherValue) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Type</Label>
        <div className="flex gap-2">
          {(['Gift', 'Voucher'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...value, gift_type: t })}
              className={cx(
                'brutal-btn rounded-xl px-4 py-2 font-sans text-sm font-bold',
                value.gift_type === t ? 'bg-yellow' : 'bg-white'
              )}
            >
              {t === 'Gift' ? '🎁 Gift' : '🎟️ Voucher'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="item_name">What is it?</Label>
        <Input
          id="item_name"
          placeholder="e.g. Spa day for two"
          value={value.item_name}
          onChange={(e) => onChange({ ...value, item_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="gift_description">Details</Label>
        <Textarea
          id="gift_description"
          rows={3}
          placeholder="Tell them (or keep it a mystery for now)…"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </div>
      <FileUpload surpriseId={surpriseId} value={value.photo} onChange={(photo) => onChange({ ...value, photo })} label="Add a photo (optional)" />
    </div>
  );
}
