import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Copy, LayoutDashboard, TriangleAlert } from 'lucide-react';
import Button from '../../components/primitives/Button';
import Sticker from '../../components/primitives/Sticker';
import { copyToClipboard, absoluteUrl } from '../../lib/utils';
import type { PublicSurprise } from '../../types';

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border-2 border-ink bg-[#fffdf8] p-3 shadow-[var(--shadow-brutal-sm)]">
      <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink-soft">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="flex-1 truncate font-mono text-sm text-ink">{value}</p>
        <button
          type="button"
          onClick={async () => {
            const ok = await copyToClipboard(value);
            if (ok) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }
          }}
          className="brutal-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function CreateSuccess({ surprise, email }: { surprise: PublicSurprise; email: string }) {
  const navigate = useNavigate();
  const inviteUrl = absoluteUrl(`/invite/${surprise.invite_token}`);
  const revealUrl = absoluteUrl(`/surprise/${surprise.slug}`);

  return (
    <div className="mx-auto max-w-lg text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14 }}>
        <Sticker emoji="🎉" size="xl" rotate={-6} />
      </motion.div>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">It's created!</h1>
      <p className="mt-2 font-sans text-sm text-ink-soft">
        {surprise.celebrant_name}'s surprise is live in draft. Share the contributor link, then publish when you're ready.
      </p>

      <div className="mt-8 space-y-3 text-left">
        <CopyRow label="Surprise ID" value={surprise.surprise_code} />
        <CopyRow label="Contributor link" value={inviteUrl} />
        <CopyRow label="Celebrant reveal link" value={revealUrl} />
        <div className="rounded-xl border-2 border-ink bg-[#fffdf8] p-3 shadow-[var(--shadow-brutal-sm)]">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink-soft">Confirmed email</p>
          <p className="mt-1 font-sans text-sm text-ink">{email}</p>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border-2 border-ink bg-peach/60 p-3 text-left shadow-[var(--shadow-brutal-sm)]">
        <TriangleAlert size={18} className="mt-0.5 shrink-0" />
        <p className="font-sans text-xs font-semibold text-ink">
          Save your Surprise ID and password somewhere safe — you'll need both to get back into this dashboard later.
        </p>
      </div>

      <Button
        className="mt-8 w-full justify-center"
        icon={<LayoutDashboard size={16} />}
        onClick={() => navigate(`/dashboard/${surprise.id}`)}
      >
        Go to dashboard
      </Button>
    </div>
  );
}
