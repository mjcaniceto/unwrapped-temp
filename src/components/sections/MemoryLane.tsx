import { motion } from 'framer-motion';
import type { Contribution } from '../../types';
import SectionHeader from '../primitives/SectionHeader';
import WashiTape from '../primitives/WashiTape';

export default function MemoryLane({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <SectionHeader chapter="Chapter 03" title="Memory Lane" emoji="📸" />
      <div className="relative mt-12 space-y-14">
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-ink/15 sm:block" />
        {contributions.map((c, i) => {
          const flip = i % 2 === 1;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: flip ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className={`relative grid items-center gap-6 sm:grid-cols-2 ${flip ? 'sm:[&>*:first-child]:order-2' : ''}`}
            >
              <div className="relative rotate-[-1.5deg]">
                <WashiTape color="peach" className="left-6 -top-3" />
                <div className="overflow-hidden rounded-2xl border-2 border-ink shadow-[var(--shadow-brutal-lg)]">
                  {c.media_type === 'video' ? (
                    <video src={c.media_url ?? ''} controls className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <img src={c.media_url ?? ''} alt="" className="aspect-[4/3] w-full object-cover" />
                  )}
                </div>
              </div>
              <div className={flip ? 'sm:text-right' : ''}>
                <p className="font-display text-xl italic leading-relaxed text-ink">“{c.content?.description}”</p>
                <p className="mt-3 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
                  {c.contributor_name}
                  {c.contributor_relationship ? ` · ${c.contributor_relationship}` : ''}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
