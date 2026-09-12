import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../components/primitives/Button';
import { WizardProgress, WizardStep } from './create/WizardShell';
import Step1Celebrant, { type CelebrantInfo } from './create/Step1Celebrant';
import Step2Theme from './create/Step2Theme';
import Step3Sections from './create/Step3Sections';
import Step4Configure, { type FinalRevealDraft } from './create/Step4Configure';
import Step5Blueprint, { type Credentials } from './create/Step5Blueprint';
import CreateSuccess from './create/CreateSuccess';
import { defaultSections } from '../lib/utils';
import { createSurprise, updateSurprise } from '../lib/queries';
import { setDashboardSession } from '../lib/supabase';
import { uploadMedia } from '../lib/upload';
import type { PublicSurprise, SectionConfig, Theme } from '../types';

const TOTAL_STEPS = 5;

export default function Create() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicSurprise | null>(null);

  const [celebrant, setCelebrant] = useState<CelebrantInfo>({
    celebrant_name: '',
    celebrant_photo_file: null,
    celebrant_photo_preview: null,
    birthday: '',
    age: '',
    description: '',
  });
  const [theme, setTheme] = useState<Theme>('warm');
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections());
  const [finalReveal, setFinalReveal] = useState<FinalRevealDraft>({
    title: '',
    message: '',
    image_file: null,
    image_preview: null,
    video_file: null,
    video_preview: null,
    external_url: '',
  });
  const [credentials, setCredentials] = useState<Credentials>({ email: '', password: '', confirmPassword: '' });
  const [credErrors, setCredErrors] = useState<Partial<Record<keyof Credentials, string>>>({});

  function validateStep(): boolean {
    if (step === 1) return celebrant.celebrant_name.trim().length > 0;
    if (step === 4) {
      const quiz = sections.find((s) => s.type === 'quiz' && s.enabled);
      if (quiz) {
        const questions = quiz.questions ?? [];
        if (questions.length === 0) return false;
        for (const q of questions) {
          if (!q.text.trim()) return false;
          if (q.options.filter((o) => o.trim()).length < 2) return false;
        }
      }
    }
    return true;
  }

  function validateCredentials(): boolean {
    const errs: Partial<Record<keyof Credentials, string>> = {};
    if (!credentials.email.trim() || !/^\S+@\S+\.\S+$/.test(credentials.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (credentials.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (credentials.confirmPassword !== credentials.password) {
      errs.confirmPassword = 'Passwords don\u2019t match.';
    }
    setCredErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validateCredentials()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { surprise, session_token } = await createSurprise({
        creator_email: credentials.email.trim(),
        creator_password: credentials.password,
        celebrant_name: celebrant.celebrant_name.trim(),
        birthday: celebrant.birthday || null,
        age: celebrant.age ? Number(celebrant.age) : null,
        description: celebrant.description.trim() || null,
        theme,
        sections: sections.map((s, i) => ({ ...s, position: i })),
        final_reveal:
          finalReveal.title || finalReveal.message || finalReveal.external_url
            ? { title: finalReveal.title, message: finalReveal.message, external_url: finalReveal.external_url || undefined }
            : null,
      });

      setDashboardSession(session_token, surprise.id);

      // Upload any media collected during the wizard now that the surprise exists.
      const patch: Record<string, any> = {};
      if (celebrant.celebrant_photo_file) {
        patch.celebrant_photo_url = await uploadMedia(celebrant.celebrant_photo_file, surprise.id);
      }
      if (finalReveal.image_file || finalReveal.video_file) {
        const reveal = { ...(surprise.final_reveal ?? {}) } as any;
        if (finalReveal.image_file) reveal.image_url = await uploadMedia(finalReveal.image_file, surprise.id);
        if (finalReveal.video_file) reveal.video_url = await uploadMedia(finalReveal.video_file, surprise.id);
        patch.final_reveal = reveal;
      }
      let finalSurprise = surprise;
      if (Object.keys(patch).length > 0) {
        const updatedPatch = await updateSurprise(surprise.id, patch);
        finalSurprise = {
          ...surprise,
          ...updatedPatch,
        };
      }

      setResult(finalSurprise);
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Something went wrong creating your surprise. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="paper-texture min-h-screen bg-paper px-5 py-16">
        <CreateSuccess surprise={result} email={credentials.email} />
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-bold text-ink">
            🎁 Unwrapped
          </Link>
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink-soft">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        <WizardProgress step={step} />

        <AnimatePresence mode="wait">
          <WizardStep key={step}>
            {step === 1 && <Step1Celebrant value={celebrant} onChange={setCelebrant} />}
            {step === 2 && <Step2Theme value={theme} onChange={setTheme} />}
            {step === 3 && <Step3Sections sections={sections} onChange={setSections} />}
            {step === 4 && (
              <Step4Configure
                sections={sections}
                onChange={setSections}
                finalReveal={finalReveal}
                onFinalRevealChange={setFinalReveal}
              />
            )}
            {step === 5 && (
              <Step5Blueprint
                celebrant={celebrant}
                theme={theme}
                sections={sections}
                onReorder={setSections}
                credentials={credentials}
                onCredentialsChange={setCredentials}
                errors={credErrors}
              />
            )}
          </WizardStep>
        </AnimatePresence>

        {submitError && (
          <p className="mx-auto mt-6 max-w-xl rounded-xl border-2 border-ink bg-pink/70 p-3 text-center font-sans text-sm font-semibold text-ink">
            {submitError}
          </p>
        )}

        <div className="mx-auto mt-10 flex max-w-xl items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft size={16} />}
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Back
          </Button>
          {step < TOTAL_STEPS ? (
            <Button
              disabled={!validateStep()}
              onClick={() => validateStep() && setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
            >
              Continue <ArrowRight size={16} />
            </Button>
          ) : (
            <Button loading={submitting} onClick={handleSubmit}>
              Create surprise 🎉
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
