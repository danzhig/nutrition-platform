import { supabase } from './supabase'
import type { NutrientCategory } from '@/types/nutrition'
import type { ProfileId } from './rdaProfiles'

/** The full filter state that gets saved with a view. */
export interface FilterSetState {
  selectedFoods: string[]
  selectedNutrients: NutrientCategory[]
  perServing: boolean
  rdaProfileId: ProfileId | null        // built-in DV profile
  savedRdaProfileId: string | null      // user-saved DV profile UUID
}

export interface SavedFilterSet {
  id: string
  name: string
  state: FilterSetState
  created_at: string
}

export async function loadFilterSets(): Promise<SavedFilterSet[]> {
  const { data, error } = await supabase
    .from('user_filter_sets')
    .select('id, name, state, created_at')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as SavedFilterSet[]
}

export async function saveFilterSet(name: string, state: FilterSetState): Promise<SavedFilterSet> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('user_filter_sets')
    .insert({ user_id: user.id, name, state })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SavedFilterSet
}

export async function deleteFilterSet(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_filter_sets')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
