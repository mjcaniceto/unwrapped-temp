import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Contribution } from '../../types';
import { cx, relTime } from '../../lib/utils';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow text-ink',
  approved: 'bg-mint text-ink',
  hidden: 'bg-paper-dark text-ink-soft',
};

function summarize(c: Contribution): string {
  switch (c.section_type) {
    case 'note_wall':
      return c.content?.message ?? '';
    case 'gift_voucher':
      return `${c.content?.item_name ?? ''} — ${c.content?.description ?? ''}`;
    case 'memory_lane':
    case 'scrapbook':
      return c.content?.description ?? '';
    case 'wish':
      return c.content?.wish ?? '';
    default:
      return '';
  }
}

export default function ContributionRow({
  contribution,
  onApprove,
  onHide,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  contribution: Contribution;
  onApprove: () => void;
  onHide: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const c = contribution;
  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-ink bg-[#fffdf8] p-3 shadow-[var(--shadow-brutal-sm)]">
      {c.media_url && c.media_type === 'image' && (
        <img src={c.media_url} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-ink/30 object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-sans text-sm font-bold text-ink">{c.contributor_name}</p>
          <span className={cx('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', STATUS_STYLE[c.status])}>
            {c.status}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 font-sans text-xs text-ink-soft">{summarize(c)}</p>
        <p className="mt-0.5 font-sans text-[10px] text-ink-soft/70">{relTime(c.created_at)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <div className="flex gap-1">
          <button onClick={onMoveUp} disabled={!canMoveUp} className="text-ink-soft hover:text-ink disabled:opacity-20" aria-label="Move up">
            <ChevronUp size={15} />
          </button>
          <button onClick={onMoveDown} disabled={!canMoveDown} className="text-ink-soft hover:text-ink disabled:opacity-20" aria-label="Move down">
            <ChevronDown size={15} />
          </button>
        </div>
        <div className="flex gap-1.5">
          {c.status !== 'approved' && (
            <button onClick={onApprove} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-mint" aria-label="Approve">
              <Eye size={13} />
            </button>
          )}
          {c.status !== 'hidden' && (
            <button onClick={onHide} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-white" aria-label="Hide">
              <EyeOff size={13} />
            </button>
          )}
          <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-pink" aria-label="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
