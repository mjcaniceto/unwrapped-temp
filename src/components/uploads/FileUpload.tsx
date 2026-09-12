import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadMedia } from '../../lib/upload';
import { cx } from '../../lib/utils';

interface FileUploadProps {
  surpriseId: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  accept?: string;
  className?: string;
}

export default function FileUpload({
  surpriseId,
  value,
  onChange,
  label = 'Add a photo',
  accept = 'image/*',
  className,
}: FileUploadProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const url = await uploadMedia(file, surpriseId);
      onChange(url);
    } catch (e: any) {
      setError('Upload failed. Try a smaller file.');
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className={cx('relative inline-block', className)}>
        <img src={value} alt="" className="h-28 w-28 rounded-xl border-2 border-ink object-cover shadow-[var(--shadow-brutal-sm)]" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-pink shadow-[var(--shadow-brutal-sm)]"
          aria-label="Remove photo"
        >
          <X size={14} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="brutal-btn flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-xl bg-paper-dark text-ink-soft disabled:opacity-60"
      >
        {busy ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
        <span className="px-2 text-center text-[11px] font-semibold leading-tight">{busy ? 'Uploading…' : label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-1 text-xs font-semibold text-pink-deep">{error}</p>}
    </div>
  );
}
