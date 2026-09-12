import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fireFinaleConfetti } from '../../lib/confetti';

export default function Finale({ celebrantName }: { celebrantName: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  if (inView && !fired.current) {
    fired.current = true;
    fireFinaleConfetti();
  }

  return (
    <section ref={ref} className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="font-display text-5xl font-black leading-tight text-ink sm:text-7xl"
      >
        Happy Birthday,
        <br />
        {celebrantName}! ❤️
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft"
      >
        made with love, unwrapped for you
      </motion.p>
    </section>
  );
}
