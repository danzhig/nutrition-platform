import { supabase } from './supabase'
import type { RDAValues } from './rdaProfiles'

export interface SavedProfile {
  id: string
  name: string
  values: RDAValues
  created_at: string
  updated_at: string
}

export async function loadSavedProfiles(): Promise<SavedProfile[]> {
  const { data, error } = await supabase
    .from('user_rda_profiles')
    .select('id, name, values, created_at, updated_at')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as SavedProfile[]
}

export async function saveNewProfile(name: string, values: RDAValues): Promise<SavedProfile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('user_rda_profiles')
    .insert({ user_id: user.id, name, values })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SavedProfile
}

export async function updateSavedProfile(id: string, name: string, values: RDAValues): Promise<void> {
  const { error } = await supabase
    .from('user_rda_profiles')
    .update({ name, values, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteSavedProfile(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_rda_profiles')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
