import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Contribution } from '../../types';
import SectionHeader from '../primitives/SectionHeader';
import Polaroid from '../primitives/Polaroid';

const ROTATIONS = [-6, 4, -3, 7, -8, 3];

export default function Scrapbook({ contributions }: { contributions: Contribution[] }) {
  const [page, setPage] = useState(0);
  if (contributions.length === 0) return null;
  const current = contributions[page];
  const images: string[] = current.content?.images ?? [];

  function go(dir: 1 | -1) {
    setPage((p) => Math.min(contributions.length - 1, Math.max(0, p + dir)));
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <SectionHeader chapter="Chapter 04" title="The Scrapbook" emoji="📖" subtitle="Tap to turn the page" />

      <div className="relative mt-10" style={{ perspective: 1600 }}>
        <div
          className="relative mx-auto min-h-[420px] max-w-xl cursor-pointer rounded-3xl border-2 border-ink bg-[#fffdf8] p-6 shadow-[var(--shadow-brutal-lg)] sm:p-10"
          onClick={() => go(1)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
            >
              <div className="flex flex-wrap justify-center gap-4">
                {images.map((src, i) => (
                  <Polaroid key={src + i} src={src} rotate={ROTATIONS[i % ROTATIONS.length]} size="md" />
                ))}
              </div>
              <p className="mx-auto mt-6 max-w-sm text-center font-hand text-2xl leading-snug text-ink-soft">
                {current.content?.description}
              </p>
              <p className="mt-3 text-center font-sans text-[11px] font-bold uppercase tracking-wider text-ink/60">
                {current.contributor_name}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            disabled={page === 0}
            className="brutal-btn flex h-9 w-9 items-center justify-center rounded-full bg-white disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
            Page {page + 1} of {contributions.length}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            disabled={page === contributions.length - 1}
            className="brutal-btn flex h-9 w-9 items-center justify-center rounded-full bg-white disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
