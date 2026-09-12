import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadMedia } from '../../lib/upload';

interface MultiImageUploadProps {
  surpriseId: string;
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function MultiImageUpload({ surpriseId, images, onChange, max = 6 }: MultiImageUploadProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setBusy(true);
    try {
      const room = Math.max(0, max - images.length);
      const list = Array.from(files).slice(0, room);
      const urls = await Promise.all(list.map((f) => uploadMedia(f, surpriseId)));
      onChange([...images, ...urls]);
    } catch {
      setError('One or more uploads failed. Try smaller files.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={src + i} className="relative">
            <img src={src} alt="" className="h-20 w-20 rounded-xl border-2 border-ink object-cover shadow-[var(--shadow-brutal-sm)]" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-pink shadow-[var(--shadow-brutal-sm)]"
              aria-label="Remove image"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="brutal-btn flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl bg-paper-dark text-ink-soft disabled:opacity-60"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-[10px] font-semibold">{busy ? '…' : 'Add'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-1 text-xs font-semibold text-pink-deep">{error}</p>}
      <p className="mt-1 text-xs text-ink-soft">{images.length}/{max} photos</p>
    </div>
  );
}
