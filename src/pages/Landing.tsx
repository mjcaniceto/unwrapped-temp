import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import Polaroid from '../components/primitives/Polaroid';
import Sticker from '../components/primitives/Sticker';
import WashiTape from '../components/primitives/WashiTape';
import Button from '../components/primitives/Button';
import AccessSurpriseModal from '../components/AccessSurpriseModal';
import { SECTION_ORDER, SECTION_META } from '../types';

export default function Landing() {
  const [accessOpen, setAccessOpen] = useState(false);

  return (
    <div className="paper-texture min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="font-display text-xl font-bold tracking-tight text-ink">
          🎁 Unwrapped
        </span>
        <button
          onClick={() => setAccessOpen(true)}
          className="hidden items-center gap-1.5 font-sans text-sm font-bold text-ink-soft hover:text-ink sm:flex"
        >
          <KeyRound size={15} /> Access my surprise
        </button>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative">
            <Sticker emoji="🎉" rotate={-10} size="lg" className="absolute -left-4 -top-10 hidden sm:inline-block" />
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-5xl font-bold leading-[1.05] text-ink sm:text-6xl lg:text-7xl"
            >
              A birthday surprise,
              <br />
              made by everyone.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-md font-sans text-lg leading-relaxed text-ink-soft"
            >
              Gather notes, memories, gifts, and a quiz from everyone who loves them —
              then hand over one scrolling, confetti-ending scrapbook.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link to="/create">
                <Button variant="primary" icon={<Sparkles size={16} />}>
                  Create a Surprise
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => setAccessOpen(true)} icon={<KeyRound size={16} />}>
                Access My Surprise
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6"
            >
              <Link
                to="/surprise/demo-alex"
                className="inline-flex items-center gap-1 font-sans text-sm font-bold text-ink-soft underline decoration-ink/30 decoration-2 underline-offset-4 hover:text-ink"
              >
                See a demo surprise <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Section chips */}
            <div className="mt-10 flex flex-wrap gap-2">
              {SECTION_ORDER.map((s) => (
                <Sticker key={s} emoji={SECTION_META[s].emoji} label={SECTION_META[s].label} />
              ))}
            </div>
          </div>

          {/* Polaroid collage */}
          <div className="relative mx-auto h-[420px] w-full max-w-sm">
            <WashiTape color="mint" className="left-1/2 top-2 -translate-x-1/2" width={110} />
            <Polaroid
              src="https://picsum.photos/seed/hero-1/500/500"
              caption="Happy 30th!"
              rotate={-8}
              size="lg"
              className="absolute left-2 top-6"
            />
            <Polaroid
              src="https://picsum.photos/seed/hero-2/500/500"
              caption="the crew 🎂"
              rotate={7}
              size="md"
              className="absolute right-0 top-0"
            />
            <Polaroid
              src="https://picsum.photos/seed/hero-3/500/500"
              caption="besties"
              rotate={4}
              size="md"
              className="absolute bottom-2 left-10"
            />
            <Sticker emoji="🌟" rotate={12} size="lg" className="absolute -right-2 bottom-16" />
            <Sticker emoji="💌" rotate={-15} size="md" className="absolute bottom-0 right-1/3" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <p className="text-center font-sans text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">
          How it works
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold text-ink sm:text-4xl">
          Three steps, zero accounts.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { emoji: '🧵', title: 'Build the lineup', body: 'Pick sections, set a theme, invite people with one link. No sign-up required.' },
            { emoji: '📬', title: 'Everyone chips in', body: 'Friends and family open the link, add notes, photos, gifts, and quiz answers.' },
            { emoji: '🎊', title: 'Reveal it', body: 'Approve your favorites, publish, and send the reveal link for the big scroll.' },
          ].map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border-2 border-ink bg-[#fffdf8] p-6 shadow-[var(--shadow-brutal)]"
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <span className="text-3xl">{step.emoji}</span>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 font-sans text-sm text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-center font-sans text-xs text-ink-soft">
        Made for the people who plan the party nobody else sees coming.
      </footer>

      {accessOpen && <AccessSurpriseModal onClose={() => setAccessOpen(false)} />}
    </div>
  );
}
