import { supabase } from './supabase'

export interface UserPreferences {
  default_profile: string
}

export async function loadUserPreferences(): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('default_profile')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return { default_profile: data.default_profile ?? '' }
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      { user_id: user.id, default_profile: prefs.default_profile, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) throw new Error(error.message)
}

export async function deleteUserPreferences(): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .neq('user_id', '00000000-0000-0000-0000-000000000000') // deletes current user's row (RLS scopes to auth.uid())

  if (error) throw new Error(error.message)
}
