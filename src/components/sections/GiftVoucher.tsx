import { motion } from 'framer-motion';
import type { Contribution } from '../../types';
import { STICKY_COLORS } from '../../types';
import PaperCard from '../primitives/PaperCard';
import SectionHeader from '../primitives/SectionHeader';

export default function GiftVoucher({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <SectionHeader chapter="Chapter 02" title="Gifts & Vouchers" emoji="🎁" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {contributions.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
          >
            <PaperCard color={STICKY_COLORS[i % STICKY_COLORS.length]} rotate={i % 2 === 0 ? -1.5 : 1.5} className="p-5">
              <span className="inline-block rounded-full border-2 border-ink bg-[#fffdf8] px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wider">
                {c.content?.gift_type === 'Voucher' ? '🎟️ Voucher' : '🎁 Gift'}
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-ink">{c.content?.item_name}</h3>
              <p className="mt-1.5 font-sans text-sm text-ink-soft">{c.content?.description}</p>
              {c.media_url && (
                <img src={c.media_url} alt="" className="mt-3 aspect-video w-full rounded-lg border-2 border-ink object-cover" />
              )}
              <p className="mt-4 text-right font-sans text-[11px] font-bold uppercase tracking-wider text-ink/60">
                From {c.contributor_name}
              </p>
            </PaperCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
