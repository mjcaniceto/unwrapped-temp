import { motion } from 'framer-motion';
import type { Contribution } from '../../types';
import { STICKY_COLORS } from '../../types';
import Corkboard from '../primitives/Corkboard';
import Pushpin from '../primitives/Pushpin';
import PaperCard from '../primitives/PaperCard';
import SectionHeader from '../primitives/SectionHeader';

export default function NoteWall({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <SectionHeader chapter="Chapter 01" title="The Note Wall" emoji="💌" />
      <div className="mt-10">
        <Corkboard>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {contributions.map((c, i) => {
              const color = STICKY_COLORS[i % STICKY_COLORS.length];
              const rotate = ((i * 37) % 11) - 5;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                  className="relative"
                >
                  <Pushpin className="left-1/2 -top-2 -translate-x-1/2" seed={i} />
                  <PaperCard color={color} rotate={rotate} className="p-4">
                    {c.media_url && (
                      <img src={c.media_url} alt="" className="mb-2 aspect-video w-full rounded-md object-cover" />
                    )}
                    <p className="font-hand text-xl leading-snug text-ink">{c.content?.message}</p>
                    <p className="mt-3 text-right font-sans text-[11px] font-bold uppercase tracking-wider text-ink/60">
                      — {c.contributor_name}
                      {c.contributor_relationship ? `, ${c.contributor_relationship}` : ''}
                    </p>
                  </PaperCard>
                </motion.div>
              );
            })}
          </div>
        </Corkboard>
      </div>
    </section>
  );
}
