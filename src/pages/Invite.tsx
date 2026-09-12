import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import Button from '../components/primitives/Button';
import { Input, Label } from '../components/primitives/Field';
import Sticker from '../components/primitives/Sticker';
import NoteWallForm, { type NoteWallValue } from '../components/invite/NoteWallForm';
import GiftVoucherForm, { type GiftVoucherValue } from '../components/invite/GiftVoucherForm';
import MemoryLaneForm, { type MemoryLaneValue } from '../components/invite/MemoryLaneForm';
import ScrapbookForm, { type ScrapbookValue } from '../components/invite/ScrapbookForm';
import WishForm, { type WishValue } from '../components/invite/WishForm';
import QuizForm from '../components/quiz/QuizForm';
import { fetchSurpriseByInviteToken, submitContribution, submitQuizContribution } from '../lib/queries';
import { SECTION_META } from '../types';
import type { PublicSurprise, SectionType } from '../types';

const emptyNote: NoteWallValue = { message: '', photo: null };
const emptyGift: GiftVoucherValue = { gift_type: 'Gift', item_name: '', description: '', photo: null };
const emptyMemory: MemoryLaneValue = { media_url: null, media_type: '', description: '' };
const emptyScrapbook: ScrapbookValue = { images: [], description: '' };
const emptyWish: WishValue = { wish: '' };

export default function Invite() {
  const { token } = useParams<{ token: string }>();
  const [surprise, setSurprise] = useState<PublicSurprise | null | 'loading'>('loading');

  const [phase, setPhase] = useState<'welcome' | 'sections' | 'done'>('welcome');
  const [contributorName, setContributorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [note, setNote] = useState(emptyNote);
  const [gift, setGift] = useState(emptyGift);
  const [memory, setMemory] = useState(emptyMemory);
  const [scrapbook, setScrapbook] = useState(emptyScrapbook);
  const [wish, setWish] = useState(emptyWish);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchSurpriseByInviteToken(token).then(setSurprise).catch(() => setSurprise(null));
  }, [token]);

  if (surprise === 'loading') {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center bg-paper">
        <p className="font-sans text-sm font-bold text-ink-soft">Loading invitation…</p>
      </div>
    );
  }
  if (!surprise) {
    return (
      <div className="paper-texture flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
        <Sticker emoji="🙈" size="xl" />
        <h1 className="font-display text-2xl font-bold text-ink">This invite link isn't valid</h1>
        <p className="font-sans text-sm text-ink-soft">Double check the link, or ask the organizer for a fresh one.</p>
      </div>
    );
  }

  const enabledSections = (surprise.sections ?? []).filter((s) => s.enabled).sort((a, b) => a.position - b.position);
  const currentSection = enabledSections[sectionIndex];

  function resetForm(type: SectionType) {
    if (type === 'note_wall') setNote(emptyNote);
    if (type === 'gift_voucher') setGift(emptyGift);
    if (type === 'memory_lane') setMemory(emptyMemory);
    if (type === 'scrapbook') setScrapbook(emptyScrapbook);
    if (type === 'wish') setWish(emptyWish);
  }

  function isValid(type: SectionType): boolean {
    if (type === 'note_wall') return note.message.trim().length > 0;
    if (type === 'gift_voucher') return gift.item_name.trim().length > 0 && gift.description.trim().length > 0;
    if (type === 'memory_lane') return !!memory.media_url && memory.description.trim().length > 0;
    if (type === 'scrapbook') return scrapbook.images.length > 0 && scrapbook.description.trim().length > 0;
    if (type === 'wish') return wish.wish.trim().length > 0;
    return false;
  }

  async function commit(type: SectionType) {
    if (!surprise || surprise === 'loading') return;
    setSubmitting(true);
    try {
      if (type === 'note_wall') {
        await submitContribution({
          surprise_id: surprise.id,
          section_type: 'note_wall',
          contributor_name: contributorName,
          contributor_relationship: relationship || null,
          content: { message: note.message },
          media_url: note.photo,
          media_type: note.photo ? 'image' : '',
        });
      } else if (type === 'gift_voucher') {
        await submitContribution({
          surprise_id: surprise.id,
          section_type: 'gift_voucher',
          contributor_name: contributorName,
          contributor_relationship: relationship || null,
          content: { gift_type: gift.gift_type, item_name: gift.item_name, description: gift.description },
          media_url: gift.photo,
          media_type: gift.photo ? 'image' : '',
        });
      } else if (type === 'memory_lane') {
        await submitContribution({
          surprise_id: surprise.id,
          section_type: 'memory_lane',
          contributor_name: contributorName,
          contributor_relationship: relationship || null,
          content: { description: memory.description },
          media_url: memory.media_url,
          media_type: memory.media_type,
        });
      } else if (type === 'scrapbook') {
        await submitContribution({
          surprise_id: surprise.id,
          section_type: 'scrapbook',
          contributor_name: contributorName,
          contributor_relationship: relationship || null,
          content: { images: scrapbook.images, description: scrapbook.description },
        });
      } else if (type === 'wish') {
        await submitContribution({
          surprise_id: surprise.id,
          section_type: 'wish',
          contributor_name: contributorName,
          contributor_relationship: relationship || null,
          content: { wish: wish.wish },
        });
      }
      setCounts((c) => ({ ...c, [type]: (c[type] ?? 0) + 1 }));
      resetForm(type);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddAnother() {
    if (!currentSection) return;
    await commit(currentSection.type);
  }

  async function handleContinue() {
    if (!currentSection) return;
    if (isValid(currentSection.type)) {
      await commit(currentSection.type);
    }
    if (sectionIndex + 1 >= enabledSections.length) {
      setPhase('done');
    } else {
      setSectionIndex((i) => i + 1);
    }
  }

  async function handleQuizSubmit(answers: number[], questionForCelebrant: string | null) {
    if (!token) return;
    setSubmitting(true);
    try {
      await submitQuizContribution({
        invite_token: token,
        contributor_name: contributorName,
        contributor_relationship: relationship || null,
        answers,
        question_for_celebrant: questionForCelebrant,
      });
    } finally {
      setSubmitting(false);
    }
    if (sectionIndex + 1 >= enabledSections.length) {
      setPhase('done');
    } else {
      setSectionIndex((i) => i + 1);
    }
  }

  const giftMax = currentSection?.maxPerContributor ?? 3;
  const giftCount = counts['gift_voucher'] ?? 0;

  return (
    <div className="paper-texture min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-lg">
        <p className="mb-8 text-center font-display text-lg font-bold text-ink">🎁 Unwrapped</p>

        <AnimatePresence mode="wait">
          {phase === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center">
                {surprise.celebrant_photo_url && (
                  <img
                    src={surprise.celebrant_photo_url}
                    alt=""
                    className="mx-auto h-24 w-24 rounded-full border-2 border-ink object-cover shadow-[var(--shadow-brutal)]"
                  />
                )}
                <h1 className="mt-4 font-display text-3xl font-bold text-ink">
                  You're invited to surprise {surprise.celebrant_name}!
                </h1>
                <p className="mt-2 font-sans text-sm text-ink-soft">
                  Add a note, a memory, or a gift — it'll be part of their scrapbook.
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div>
                  <Label htmlFor="contributor_name">Your name</Label>
                  <Input id="contributor_name" value={contributorName} onChange={(e) => setContributorName(e.target.value)} placeholder="e.g. Priya" />
                </div>
                <div>
                  <Label htmlFor="relationship">Your relationship to {surprise.celebrant_name} (optional)</Label>
                  <Input id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g. College roommate" />
                </div>
              </div>
              <Button
                className="mt-8 w-full justify-center"
                disabled={!contributorName.trim()}
                onClick={() => setPhase('sections')}
                icon={<ArrowRight size={16} />}
              >
                Get started
              </Button>
            </motion.div>
          )}

          {phase === 'sections' && currentSection && (
            <motion.div key={currentSection.type} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className="mb-6 h-2 w-full overflow-hidden rounded-full border-2 border-ink bg-white">
                <motion.div
                  className="h-full bg-yellow"
                  animate={{ width: `${((sectionIndex + 1) / enabledSections.length) * 100}%` }}
                />
              </div>
              <p className="text-center font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
                {SECTION_META[currentSection.type].emoji} {currentSection.title}
              </p>
              <h2 className="mt-2 text-center font-display text-2xl font-bold text-ink">{currentSection.prompt}</h2>

              <div className="mt-6">
                {currentSection.type === 'note_wall' && (
                  <NoteWallForm surpriseId={surprise.id} value={note} onChange={setNote} />
                )}
                {currentSection.type === 'gift_voucher' && (
                  <GiftVoucherForm surpriseId={surprise.id} value={gift} onChange={setGift} />
                )}
                {currentSection.type === 'memory_lane' && (
                  <MemoryLaneForm surpriseId={surprise.id} value={memory} onChange={setMemory} />
                )}
                {currentSection.type === 'scrapbook' && (
                  <ScrapbookForm surpriseId={surprise.id} value={scrapbook} onChange={setScrapbook} />
                )}
                {currentSection.type === 'wish' && <WishForm value={wish} onChange={setWish} />}
                {currentSection.type === 'quiz' && (
                  <QuizForm
                    questions={currentSection.questions ?? []}
                    askQuestionToCelebrant={currentSection.askQuestionToCelebrant}
                    celebrantName={surprise.celebrant_name}
                    onSubmit={handleQuizSubmit}
                  />
                )}
              </div>

              {currentSection.type !== 'quiz' && (
                <div className="mt-6 flex items-center gap-3">
                  {currentSection.type === 'gift_voucher' && giftCount < giftMax && (
                    <Button
                      variant="secondary"
                      icon={<Plus size={15} />}
                      disabled={!isValid('gift_voucher') || submitting}
                      onClick={handleAddAnother}
                    >
                      Add another
                    </Button>
                  )}
                  <Button className="flex-1 justify-center" loading={submitting} onClick={handleContinue}>
                    Continue <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Sticker emoji="🎉" size="xl" rotate={-6} />
              <h1 className="mt-4 font-display text-3xl font-bold text-ink">Thank you, {contributorName}!</h1>
              <p className="mt-2 font-sans text-sm text-ink-soft">
                Your contributions are in. The organizer will review them before {surprise.celebrant_name}'s big reveal.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
