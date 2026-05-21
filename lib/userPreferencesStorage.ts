import { supabase } from './supabase'

// Sentinel name used to store account preferences inside user_rda_profiles.
// Filtered out of the saved-profiles list so it never appears in the UI.
export const PREFS_SENTINEL = '__np_prefs__'

export interface UserPreferences {
  default_profile: string
}

export async function loadUserPreferences(): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_rda_profiles')
    .select('values')
    .eq('name', PREFS_SENTINEL)
    .limit(1)

  if (error) throw new Error(error.message)
  const row = data?.[0]
  if (!row) return null
  const vals = row.values as Record<string, unknown>
  if (typeof vals.default_profile !== 'string') return null
  return { default_profile: vals.default_profile }
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  // Check for an existing sentinel row first
  const { data: existing } = await supabase
    .from('user_rda_profiles')
    .select('id')
    .eq('name', PREFS_SENTINEL)
    .limit(1)

  const row = existing?.[0]
  if (row) {
    const { error } = await supabase
      .from('user_rda_profiles')
      .update({ values: { default_profile: prefs.default_profile }, updated_at: new Date().toISOString() })
      .eq('id', row.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('user_rda_profiles')
      .insert({ user_id: user.id, name: PREFS_SENTINEL, values: { default_profile: prefs.default_profile } })
    if (error) throw new Error(error.message)
  }
}

export async function deleteUserPreferences(): Promise<void> {
  const { error } = await supabase
    .from('user_rda_profiles')
    .delete()
    .eq('name', PREFS_SENTINEL)
  if (error) throw new Error(error.message)
}
