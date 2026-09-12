import { motion } from 'framer-motion';
import type { Contribution } from '../../types';
import { STICKY_COLORS } from '../../types';
import SectionHeader from '../primitives/SectionHeader';
import PaperCard from '../primitives/PaperCard';

export default function Wish({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <SectionHeader chapter="Chapter 06" title="Wishes" emoji="🌟" />
      <div className="mt-10 columns-1 gap-5 sm:columns-2">
        {contributions.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
            className="mb-5 break-inside-avoid"
          >
            <PaperCard color={STICKY_COLORS[(i + 2) % STICKY_COLORS.length]} rotate={i % 2 === 0 ? -2 : 2} className="p-5">
              <p className="font-sans text-2xl leading-none">✨</p>
              <p className="mt-2 font-display text-lg leading-snug text-ink">{c.content?.wish}</p>
              <p className="mt-3 text-right font-sans text-[11px] font-bold uppercase tracking-wider text-ink/60">
                — {c.contributor_name}
              </p>
            </PaperCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
