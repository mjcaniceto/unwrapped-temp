export type Theme = 'warm' | 'fun' | 'nostalgic';

export type SectionType =
  | 'note_wall'
  | 'gift_voucher'
  | 'memory_lane'
  | 'scrapbook'
  | 'quiz'
  | 'wish';

export interface QuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface SectionConfig {
  type: SectionType;
  title: string;
  prompt: string;
  enabled: boolean;
  position: number;
  maxPerContributor?: number;
  // quiz-only
  questions?: QuizQuestion[];
  askQuestionToCelebrant?: boolean;
}

export interface FinalReveal {
  title: string;
  message: string;
  image_url?: string;
  video_url?: string;
  external_url?: string;
}

export type SurpriseStatus = 'draft' | 'published';

// Row as safely readable by the public (no password hash, no email)
export interface PublicSurprise {
  id: string;
  surprise_code: string;
  slug: string;
  invite_token: string;
  celebrant_name: string;
  celebrant_photo_url: string | null;
  birthday: string | null;
  age: number | null;
  description: string | null;
  theme: Theme;
  status: SurpriseStatus;
  published_at: string | null;
  sections: SectionConfig[];
  final_reveal: FinalReveal | null;
  created_at: string;
}

// Row as seen by the authenticated dashboard owner (still no password hash)
export interface OwnerSurprise extends PublicSurprise {
  creator_email: string;
}

export type ContributionStatus = 'pending' | 'approved' | 'hidden';
export type MediaType = 'image' | 'video' | '';

export interface Contribution {
  id: string;
  surprise_id: string;
  section_type: SectionType;
  contributor_name: string;
  contributor_relationship: string | null;
  content: Record<string, any>;
  media_url: string | null;
  media_type: MediaType;
  status: ContributionStatus;
  position: number;
  score: number | null;
  created_at: string;
}

export const SECTION_META: Record<
  SectionType,
  { label: string; emoji: string; blurb: string }
> = {
  note_wall: { label: 'Note Wall', emoji: '💌', blurb: 'A corkboard of pinned messages' },
  gift_voucher: { label: 'Gift / Voucher', emoji: '🎁', blurb: 'A present, promised' },
  memory_lane: { label: 'Memory Lane', emoji: '📸', blurb: 'A moment worth remembering' },
  scrapbook: { label: 'Scrapbook', emoji: '📖', blurb: 'A page of photos to flip through' },
  quiz: { label: 'Quiz', emoji: '🧠', blurb: 'Who knows them best?' },
  wish: { label: 'Wish', emoji: '🌟', blurb: 'A wish, written down' },
};

export const SECTION_ORDER: SectionType[] = [
  'note_wall',
  'gift_voucher',
  'memory_lane',
  'scrapbook',
  'quiz',
  'wish',
];

export const STICKY_COLORS = ['yellow', 'pink', 'mint', 'sky', 'peach', 'lavender'] as const;
export type StickyColor = (typeof STICKY_COLORS)[number];
