import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Sticker from '../components/primitives/Sticker';
import NoteWall from '../components/sections/NoteWall';
import GiftVoucher from '../components/sections/GiftVoucher';
import MemoryLane from '../components/sections/MemoryLane';
import Scrapbook from '../components/sections/Scrapbook';
import Quiz from '../components/sections/Quiz';
import Wish from '../components/sections/Wish';
import FinalReveal from '../components/sections/FinalReveal';
import Finale from '../components/sections/Finale';
import { fetchContributions, fetchSurpriseBySlug } from '../lib/queries';
import { formatDate } from '../lib/utils';
import type { Contribution, PublicSurprise, SectionType } from '../types';

const THEME_BG: Record<string, string> = {
  warm: 'from-peach/70 via-paper to-paper',
  fun: 'from-pink/60 via-sky/40 to-paper',
  nostalgic: 'from-lavender/50 via-mint/30 to-paper',
};

export default function Surprise() {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const isPreview = params.get('preview') === '1';

  const [surprise, setSurprise] = useState<PublicSurprise | null | 'loading'>('loading');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [usingDemoFallback, setUsingDemoFallback] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const s = await fetchSurpriseBySlug(slug).catch(() => null);
      setSurprise(s);
      if (!s) return;
      const cs = await fetchContributions(s.id).catch(() => []);
      const approved = cs.filter((c) => c.status === 'approved');

      if (approved.length === 0 && isPreview) {
        const demo = await fetchSurpriseBySlug('demo-alex').catch(() => null);
        if (demo) {
          const demoContribs = await fetchContributions(demo.id).catch(() => []);
          setContributions(demoContribs.filter((c) => c.status === 'approved'));
          setUsingDemoFallback(true);
          return;
        }
      }
      setContributions(approved);
    })();
  }, [slug, isPreview]);

  if (surprise === 'loading') {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center bg-paper">
        <p className="font-sans text-sm font-bold text-ink-soft">Loading…</p>
      </div>
    );
  }

  if (!surprise) {
    return (
      <div className="paper-texture flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
        <Sticker emoji="🙈" size="xl" />
        <h1 className="font-display text-2xl font-bold text-ink">This surprise isn't ready yet</h1>
        <p className="font-sans text-sm text-ink-soft">Ask the organizer to publish it, or double-check your link.</p>
      </div>
    );
  }

  const byType = (type: SectionType) =>
    contributions.filter((c) => c.section_type === type).sort((a, b) => a.position - b.position);
  const enabledSections = (surprise.sections ?? []).filter((s) => s.enabled).sort((a, b) => a.position - b.position);
  const quizSection = enabledSections.find((s) => s.type === 'quiz');

  return (
    <div className="min-h-screen bg-paper">
      {usingDemoFallback && (
        <div className="sticky top-0 z-40 bg-ink py-1.5 text-center font-sans text-xs font-bold text-paper">
          Preview mode — showing demo content because nothing's approved yet
        </div>
      )}

      {/* Intro cover */}
      <section className={`relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b px-6 text-center ${THEME_BG[surprise.theme]}`}>
        <Sticker emoji="🎈" rotate={-10} size="lg" className="absolute left-8 top-16 hidden sm:inline-block" />
        <Sticker emoji="🎊" rotate={12} size="lg" className="absolute right-10 top-24 hidden sm:inline-block" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {surprise.celebrant_photo_url && (
            <img
              src={surprise.celebrant_photo_url}
              alt=""
              className="mx-auto h-32 w-32 rounded-full border-2 border-ink object-cover shadow-[var(--shadow-brutal-lg)]"
            />
          )}
          <p className="mt-6 font-sans text-xs font-bold uppercase tracking-[0.25em] text-ink-soft">A surprise for</p>
          <h1 className="mt-2 font-display text-5xl font-black text-ink sm:text-6xl">{surprise.celebrant_name}</h1>
          {(surprise.age || surprise.birthday) && (
            <p className="mt-2 font-sans text-sm font-semibold text-ink-soft">
              {surprise.age ? `Turning ${surprise.age}` : ''} {surprise.birthday ? `· ${formatDate(surprise.birthday)}` : ''}
            </p>
          )}
          {surprise.description && (
            <p className="mx-auto mt-4 max-w-sm font-display text-lg italic text-ink-soft">{surprise.description}</p>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 0.6 }, y: { repeat: Infinity, duration: 1.8 } }}
          onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="brutal-btn absolute bottom-10 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-sans text-sm font-bold text-ink"
        >
          Begin <ChevronDown size={16} />
        </motion.button>
      </section>

      <div ref={contentRef}>
        <NoteWall contributions={byType('note_wall')} />
        <GiftVoucher contributions={byType('gift_voucher')} />
        <MemoryLane contributions={byType('memory_lane')} />
        <Scrapbook contributions={byType('scrapbook')} />
        {quizSection && (
          <Quiz contributions={byType('quiz')} questions={quizSection.questions ?? []} celebrantName={surprise.celebrant_name} />
        )}
        <Wish contributions={byType('wish')} />
        <FinalReveal reveal={surprise.final_reveal} />
        <Finale celebrantName={surprise.celebrant_name} />
      </div>
    </div>
  );
}
