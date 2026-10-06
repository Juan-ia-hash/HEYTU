import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Interest, Preference } from '@/types/domain';

export type HeytuProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  interests: Interest[];
  preferences: Preference[];
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

function metadataString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function getOrCreateProfile(
  user: User,
): Promise<HeytuProfile | null> {
  if (!supabase) return null;
  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing as HeytuProfile;

  const metadata = user.user_metadata ?? {};
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email ?? null,
      display_name:
        metadataString(metadata.full_name) ??
        metadataString(metadata.name) ??
        metadataString(user.email?.split('@')[0]),
      avatar_url:
        metadataString(metadata.avatar_url) ?? metadataString(metadata.picture),
    })
    .select('*')
    .single();

  if (error?.code === '23505') {
    const { data: racedProfile, error: retryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (retryError) throw retryError;
    return racedProfile as HeytuProfile;
  }
  if (error) throw error;
  return data as HeytuProfile;
}

export async function saveProfileDisplayName(
  userId: string,
  displayName: string,
) {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function saveProfilePreferences(
  userId: string,
  profile: Pick<
    HeytuProfile,
    'interests' | 'preferences' | 'onboarding_complete'
  >,
) {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}
