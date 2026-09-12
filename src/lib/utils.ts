import type { SectionConfig, SectionType } from '../types';
import { SECTION_ORDER, SECTION_META } from '../types';

export function defaultSections(): SectionConfig[] {
  return SECTION_ORDER.map((type, i) => ({
    type,
    title: SECTION_META[type].label,
    prompt: defaultPrompt(type),
    enabled: type !== 'gift_voucher', // optional by default per spec
    position: i,
    ...(type === 'gift_voucher' ? { maxPerContributor: 3 } : {}),
    ...(type === 'quiz'
      ? {
          questions: [
            { text: '', options: ['', ''], correctIndex: 0 },
          ],
          askQuestionToCelebrant: true,
        }
      : {}),
  }));
}

function defaultPrompt(type: SectionType) {
  switch (type) {
    case 'note_wall':
      return 'Pin a message they’ll want to keep forever.';
    case 'gift_voucher':
      return 'Promise a gift or a voucher — the details can wait.';
    case 'memory_lane':
      return 'Share a photo or video and tell the story behind it.';
    case 'scrapbook':
      return 'Add a few photos from a memory you share.';
    case 'quiz':
      return 'How well do you really know them?';
    case 'wish':
      return 'Write down a wish for their year ahead.';
  }
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(d: string | null) {
  if (!d) return '';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return d;
  }
}

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function absoluteUrl(path: string) {
  return `${window.location.origin}${path}`;
}
