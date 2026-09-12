import { supabase } from './supabase';

const BUCKET = 'surprise-media';

function randomName(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const rand = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rand}.${ext}`;
}

/**
 * Uploads a file into a per-surprise folder in the public media bucket and
 * returns its public URL. Storage policies restrict writes to that
 * surprise's own folder (named by its id), so one surprise's media can't be
 * overwritten or deleted by another.
 */
export async function uploadMedia(file: File, surpriseId: string): Promise<string> {
  const path = `${surpriseId}/${randomName(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function mediaTypeFromFile(file: File): 'image' | 'video' | '' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return '';
}
