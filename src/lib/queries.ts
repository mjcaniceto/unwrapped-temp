import { supabase } from './supabase';
import type { Contribution, ContributionStatus, FinalReveal, OwnerSurprise, PublicSurprise, SectionConfig, SectionType, Theme } from '../types';

// ---------------------------------------------------------------------------
// Reads (all via RPC — see supabase/migrations/0001_init.sql for why)
// ---------------------------------------------------------------------------

export async function fetchSurpriseBySlug(slug: string): Promise<PublicSurprise | null> {
  const { data, error } = await supabase.rpc('get_surprise_by_slug', { p_slug: slug });
  if (error) throw error;
  return (data as PublicSurprise) ?? null;
}

export async function fetchSurpriseByInviteToken(token: string): Promise<PublicSurprise | null> {
  const { data, error } = await supabase.rpc('get_surprise_by_invite_token', { p_token: token });
  if (error) throw error;
  return (data as PublicSurprise) ?? null;
}

export async function fetchDashboardSurprise(surpriseId: string): Promise<OwnerSurprise | null> {
  const { data, error } = await supabase.rpc('get_dashboard_surprise', { p_surprise_id: surpriseId });
  if (error) throw error;
  return (data as OwnerSurprise) ?? null;
}

export async function fetchContributions(surpriseId: string): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('surprise_id', surpriseId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as Contribution[]) ?? [];
}

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------

export interface CreateSurprisePayload {
  creator_email: string;
  creator_password: string;
  celebrant_name: string;
  birthday: string | null;
  age: number | null;
  description: string | null;
  theme: Theme;
  sections: SectionConfig[];
  final_reveal: FinalReveal | null;
}

export async function createSurprise(payload: CreateSurprisePayload) {
  const { data, error } = await supabase.rpc('create_surprise', {
    p_creator_email: payload.creator_email,
    p_creator_password: payload.creator_password,
    p_celebrant_name: payload.celebrant_name,
    p_birthday: payload.birthday,
    p_age: payload.age,
    p_description: payload.description,
    p_theme: payload.theme,
    p_sections: payload.sections,
    p_final_reveal: payload.final_reveal,
  });
  if (error) throw error;
  return data as { surprise: PublicSurprise; session_token: string };
}

// ---------------------------------------------------------------------------
// Dashboard mutations (RLS-scoped to the authenticated surprise session)
// ---------------------------------------------------------------------------

export async function updateSurprise(id: string, patch: Partial<PublicSurprise>) {
  const { data, error } = await supabase.from('surprises').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as PublicSurprise;
}

export async function setSurpriseStatus(id: string, status: 'draft' | 'published') {
  return updateSurprise(id, {
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
  } as Partial<PublicSurprise>);
}

export async function moderateContribution(id: string, status: ContributionStatus) {
  const { error } = await supabase.from('contributions').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function reorderContribution(id: string, position: number) {
  const { error } = await supabase.from('contributions').update({ position }).eq('id', id);
  if (error) throw error;
}

export async function deleteContribution(id: string) {
  const { error } = await supabase.from('contributions').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Contributor (invite) submissions
// ---------------------------------------------------------------------------

export interface NewContribution {
  surprise_id: string;
  section_type: SectionType;
  contributor_name: string;
  contributor_relationship: string | null;
  content: Record<string, any>;
  media_url?: string | null;
  media_type?: 'image' | 'video' | '';
}

export async function submitContribution(c: NewContribution) {
  const { error } = await supabase.from('contributions').insert({
    surprise_id: c.surprise_id,
    section_type: c.section_type,
    contributor_name: c.contributor_name,
    contributor_relationship: c.contributor_relationship,
    content: c.content,
    media_url: c.media_url ?? null,
    media_type: c.media_type ?? '',
    status: 'pending',
  });
  if (error) throw error;
}

export async function submitQuizContribution(args: {
  invite_token: string;
  contributor_name: string;
  contributor_relationship: string | null;
  answers: number[];
  question_for_celebrant: string | null;
}) {
  const { data, error } = await supabase.rpc('submit_quiz_contribution', {
    p_invite_token: args.invite_token,
    p_contributor_name: args.contributor_name,
    p_contributor_relationship: args.contributor_relationship,
    p_answers: args.answers,
    p_question_for_celebrant: args.question_for_celebrant,
  });
  if (error) throw error;
  return data as { id: string; score: number; total: number };
}
