import { motion } from 'framer-motion';
import type { Contribution, QuizQuestion } from '../../types';
import SectionHeader from '../primitives/SectionHeader';
import PaperCard from '../primitives/PaperCard';

interface QuizProps {
  contributions: Contribution[];
  questions: QuizQuestion[];
  celebrantName: string;
}

export default function Quiz({ contributions, questions, celebrantName }: QuizProps) {
  if (contributions.length === 0) return null;
  const total = questions.length;
  const ranked = [...contributions].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const questionsAsked = ranked.filter((c) => c.content?.questionForCelebrant);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <SectionHeader chapter="Chapter 05" title="Who Knows You Best?" emoji="🧠" subtitle={`${total} questions, ${ranked.length} people who think they know you`} />

      <div className="mt-10 space-y-3">
        {ranked.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <PaperCard color={i === 0 ? 'yellow' : 'white'} className="flex items-center gap-4 p-4">
              <span className="w-7 shrink-0 text-center font-display text-xl font-bold text-ink">
                {i === 0 ? '👑' : `#${i + 1}`}
              </span>
              <div className="flex-1">
                <p className="font-sans text-sm font-bold text-ink">
                  {c.contributor_name}
                  {c.contributor_relationship ? (
                    <span className="ml-1 font-normal text-ink-soft">· {c.contributor_relationship}</span>
                  ) : null}
                </p>
              </div>
              <p className="font-display text-lg font-bold text-ink">
                {c.score ?? 0}
                <span className="text-sm font-normal text-ink-soft">/{total}</span>
              </p>
            </PaperCard>
          </motion.div>
        ))}
      </div>

      {questionsAsked.length > 0 && (
        <div className="mt-12">
          <p className="mb-4 text-center font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
            Questions for {celebrantName}
          </p>
          <div className="space-y-4">
            {questionsAsked.map((c) => (
              <PaperCard key={c.id} color="lavender" rotate={-1} className="p-4">
                <p className="font-display text-lg italic text-ink">“{c.content?.questionForCelebrant}”</p>
                <p className="mt-2 text-right font-sans text-[11px] font-bold uppercase tracking-wider text-ink/60">
                  — {c.contributor_name}
                </p>
              </PaperCard>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
