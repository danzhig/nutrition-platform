import { supabase } from './supabase'
import type { MealItem } from '@/types/meals'
import { nullSourceId } from './foodLogStorage'

export interface SavedMeal {
  id: string
  name: string
  items: MealItem[]
  created_at: string
  updated_at: string
}

export async function loadSavedMeals(): Promise<SavedMeal[]> {
  const { data, error } = await supabase
    .from('saved_meals')
    .select('id, name, items, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as SavedMeal[]
}

export async function createSavedMeal(name: string, items: MealItem[]): Promise<SavedMeal> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('saved_meals')
    .insert({ user_id: user.id, name, items })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SavedMeal
}

export async function deleteSavedMeal(id: string): Promise<void> {
  await nullSourceId(id)

  const { error } = await supabase
    .from('saved_meals')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
