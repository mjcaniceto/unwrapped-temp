import { motion } from 'framer-motion';
import type { FinalReveal as FinalRevealType } from '../../types';
import Sticker from '../primitives/Sticker';

export default function FinalReveal({ reveal }: { reveal: FinalRevealType | null }) {
  if (!reveal || (!reveal.title && !reveal.message)) return null;
  return (
    <section className="relative mx-auto max-w-2xl px-4 py-20 text-center">
      <Sticker emoji="🎉" size="lg" rotate={-8} className="absolute -left-2 top-0 sm:left-4" />
      <Sticker emoji="🎂" size="lg" rotate={8} className="absolute -right-2 top-0 sm:right-4" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">One Last Thing</p>
        {reveal.title && <h2 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">{reveal.title}</h2>}
        {reveal.image_url && (
          <img
            src={reveal.image_url}
            alt=""
            className="mx-auto mt-8 w-full max-w-md rounded-2xl border-2 border-ink object-cover shadow-[var(--shadow-brutal-lg)]"
          />
        )}
        {reveal.video_url && (
          <video
            src={reveal.video_url}
            controls
            className="mx-auto mt-8 w-full max-w-md rounded-2xl border-2 border-ink shadow-[var(--shadow-brutal-lg)]"
          />
        )}
        {reveal.message && (
          <p className="mx-auto mt-6 max-w-lg font-display text-xl italic leading-relaxed text-ink">{reveal.message}</p>
        )}
        {reveal.external_url && (
          <a
            href={reveal.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn mt-8 inline-flex rounded-xl bg-yellow px-6 py-3 font-sans text-sm font-bold text-ink"
          >
            Open the surprise ↗
          </a>
        )}
      </motion.div>
    </section>
  );
}
