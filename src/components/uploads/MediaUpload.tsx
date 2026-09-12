import { useRef, useState } from 'react';
import { FileVideo, ImagePlus, Loader2, X } from 'lucide-react';
import { uploadMedia, mediaTypeFromFile } from '../../lib/upload';

interface MediaUploadProps {
  surpriseId: string;
  url: string | null;
  type: 'image' | 'video' | '';
  onChange: (url: string | null, type: 'image' | 'video' | '') => void;
}

export default function MediaUpload({ surpriseId, url, type, onChange }: MediaUploadProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const publicUrl = await uploadMedia(file, surpriseId);
      onChange(publicUrl, mediaTypeFromFile(file));
    } catch {
      setError('Upload failed. Try a smaller file.');
    } finally {
      setBusy(false);
    }
  }

  if (url) {
    return (
      <div className="relative inline-block w-full max-w-xs">
        {type === 'video' ? (
          <video src={url} controls className="w-full rounded-xl border-2 border-ink shadow-[var(--shadow-brutal)]" />
        ) : (
          <img src={url} alt="" className="w-full rounded-xl border-2 border-ink object-cover shadow-[var(--shadow-brutal)]" />
        )}
        <button
          type="button"
          onClick={() => onChange(null, '')}
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-pink shadow-[var(--shadow-brutal-sm)]"
          aria-label="Remove media"
        >
          <X size={14} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="brutal-btn flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl bg-paper-dark py-8 text-ink-soft disabled:opacity-60"
      >
        {busy ? (
          <Loader2 size={26} className="animate-spin" />
        ) : (
          <span className="flex gap-2">
            <ImagePlus size={22} /> <FileVideo size={22} />
          </span>
        )}
        <span className="text-sm font-semibold">{busy ? 'Uploading…' : 'Add a photo or video'}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
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
