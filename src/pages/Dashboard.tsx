import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Copy, Eye, LogOut, Rocket, Undo2 } from 'lucide-react';
import Button from '../components/primitives/Button';
import { Input, Label, FieldError } from '../components/primitives/Field';
import Sticker from '../components/primitives/Sticker';
import ContributionRow from '../components/dashboard/ContributionRow';
import QuizResponseViewer from '../components/quiz/QuizResponseViewer';
import { hasActiveDashboardSession, logoutDashboard, verifyDashboardPassword } from '../lib/dashboardAuth';
import {
  deleteContribution,
  fetchContributions,
  fetchDashboardSurprise,
  moderateContribution,
  reorderContribution,
  setSurpriseStatus,
} from '../lib/queries';
import { absoluteUrl, copyToClipboard } from '../lib/utils';
import { SECTION_META } from '../types';
import type { Contribution, OwnerSurprise } from '../types';

function DashboardGate({ surpriseId, onUnlocked }: { surpriseId: string; onUnlocked: () => void }) {
  const [surpriseCode, setSurpriseCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await verifyDashboardPassword(surpriseCode, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.surpriseId !== surpriseId) {
      navigate(`/dashboard/${result.surpriseId}`, { replace: true });
      return;
    }
    onUnlocked();
  }

  return (
    <div className="paper-texture flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm rounded-3xl border-2 border-ink bg-[#fffdf8] p-7 shadow-[var(--shadow-brutal-xl)]">
        <Sticker emoji="🔒" size="lg" rotate={-6} />
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">This dashboard is locked</h1>
        <p className="mt-1 font-sans text-sm text-ink-soft">Enter the Surprise ID and password to continue.</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="gate-id">Surprise ID</Label>
            <Input id="gate-id" value={surpriseCode} onChange={(e) => setSurpriseCode(e.target.value.toUpperCase())} />
          </div>
          <div>
            <Label htmlFor="gate-pw">Password</Label>
            <Input id="gate-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" loading={loading} className="w-full justify-center">
            Unlock dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-[#fffdf8] p-4 text-center shadow-[var(--shadow-brutal-sm)]">
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-ink-soft">{label}</p>
    </div>
  );
}

function CopyChip({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        if (await copyToClipboard(value)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className="brutal-btn flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 font-sans text-xs font-bold text-ink"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />} {label}
    </button>
  );
}

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [surprise, setSurprise] = useState<OwnerSurprise | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) setUnlocked(hasActiveDashboardSession(id));
  }, [id]);

  useEffect(() => {
    if (!id || !unlocked) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, unlocked]);

  async function load() {
    if (!id) return;
    setLoading(true);
    const [s, c] = await Promise.all([fetchDashboardSurprise(id), fetchContributions(id)]);
    setSurprise(s);
    setContributions(c);
    setLoading(false);
  }

  async function handlePublishToggle() {
    if (!surprise) return;
    setBusy(true);
    try {
      const updated = await setSurpriseStatus(surprise.id, surprise.status === 'published' ? 'draft' : 'published');
      setSurprise({ ...surprise, ...updated });
    } finally {
      setBusy(false);
    }
  }

  async function handleModerate(c: Contribution, status: Contribution['status']) {
    setContributions((cs) => cs.map((x) => (x.id === c.id ? { ...x, status } : x)));
    await moderateContribution(c.id, status);
  }

  async function handleDelete(c: Contribution) {
    if (!confirm('Delete this contribution? This can\u2019t be undone.')) return;
    setContributions((cs) => cs.filter((x) => x.id !== c.id));
    await deleteContribution(c.id);
  }

  async function handleMove(list: Contribution[], index: number, dir: -1 | 1) {
    const swap = index + dir;
    if (swap < 0 || swap >= list.length) return;
    const a = list[index];
    const b = list[swap];
    setContributions((cs) =>
      cs.map((x) => (x.id === a.id ? { ...x, position: b.position } : x.id === b.id ? { ...x, position: a.position } : x))
    );
    await Promise.all([reorderContribution(a.id, b.position), reorderContribution(b.id, a.position)]);
  }

  async function handleLogout() {
    await logoutDashboard();
    navigate('/');
  }

  if (!id) return null;
  if (!unlocked) return <DashboardGate surpriseId={id} onUnlocked={() => setUnlocked(true)} />;
  if (loading || !surprise) {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center bg-paper">
        <p className="font-sans text-sm font-bold text-ink-soft">Loading dashboard…</p>
      </div>
    );
  }

  const total = contributions.length;
  const approved = contributions.filter((c) => c.status === 'approved').length;
  const contributorCount = new Set(contributions.map((c) => c.contributor_name.toLowerCase())).size;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const enabledSections = (surprise.sections ?? []).filter((s) => s.enabled).sort((a, b) => a.position - b.position);
  const inviteUrl = absoluteUrl(`/invite/${surprise.invite_token}`);
  const revealUrl = absoluteUrl(`/surprise/${surprise.slug}`);

  return (
    <div className="paper-texture min-h-screen bg-paper pb-20">
      <header className="border-b-2 border-ink bg-[#fffdf8]">
        <div className="mx-auto max-w-5xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {surprise.celebrant_photo_url ? (
                <img src={surprise.celebrant_photo_url} alt="" className="h-12 w-12 rounded-full border-2 border-ink object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-yellow text-xl">🎂</span>
              )}
              <div>
                <h1 className="font-display text-2xl font-bold text-ink">{surprise.celebrant_name}'s surprise</h1>
                <p className="font-sans text-xs text-ink-soft">
                  Surprise ID <span className="font-bold text-ink">{surprise.surprise_code}</span> · {surprise.creator_email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border-2 border-ink px-3 py-1 font-sans text-xs font-bold uppercase ${
                  surprise.status === 'published' ? 'bg-mint' : 'bg-yellow'
                }`}
              >
                {surprise.status}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-1 font-sans text-xs font-bold text-ink-soft hover:text-ink">
                <LogOut size={14} /> Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid grid-cols-3 gap-3 sm:max-w-md">
          <StatCard label="Contributors" value={contributorCount} />
          <StatCard label="Contributions" value={total} />
          <StatCard label="% Approved" value={`${pct}%`} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CopyChip value={inviteUrl} label="Copy contributor link" />
          <CopyChip value={revealUrl} label="Copy reveal link" />
          <a href={`/surprise/${surprise.slug}?preview=1`} target="_blank" rel="noreferrer">
            <span className="brutal-btn flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 font-sans text-xs font-bold text-ink">
              <Eye size={13} /> Preview
            </span>
          </a>
          <Button
            variant={surprise.status === 'published' ? 'ghost' : 'secondary'}
            icon={surprise.status === 'published' ? <Undo2 size={15} /> : <Rocket size={15} />}
            loading={busy}
            onClick={handlePublishToggle}
            className="ml-auto"
          >
            {surprise.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>

        <div className="mt-10 space-y-10">
          {enabledSections.map((section) => {
            const items = contributions
              .filter((c) => c.section_type === section.type)
              .sort((a, b) => a.position - b.position);
            const meta = SECTION_META[section.type];

            return (
              <div key={section.type}>
                <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
                  <span>{meta.emoji}</span> {section.title}
                  <span className="font-sans text-xs font-normal text-ink-soft">({items.length})</span>
                </h2>

                {section.type === 'quiz' ? (
                  <QuizResponseViewer contributions={items} questions={section.questions ?? []} />
                ) : items.length === 0 ? (
                  <p className="font-sans text-sm text-ink-soft">No contributions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((c, i) => (
                      <ContributionRow
                        key={c.id}
                        contribution={c}
                        onApprove={() => handleModerate(c, 'approved')}
                        onHide={() => handleModerate(c, 'hidden')}
                        onDelete={() => handleDelete(c)}
                        onMoveUp={() => handleMove(items, i, -1)}
                        onMoveDown={() => handleMove(items, i, 1)}
                        canMoveUp={i > 0}
                        canMoveDown={i < items.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
