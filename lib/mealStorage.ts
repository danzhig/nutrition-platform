import { supabase } from './supabase'
import type { Meal } from '@/types/meals'
import { nullSourceId } from './foodLogStorage'

export interface SavedMealPlan {
  id: string
  name: string
  meals: Meal[]
  rda_selection: string
  created_at: string
  updated_at: string
}

export async function loadMealPlans(): Promise<SavedMealPlan[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('id, name, meals, rda_selection, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as SavedMealPlan[]
}

export async function createMealPlan(
  name: string,
  meals: Meal[],
  rda_selection: string
): Promise<SavedMealPlan> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('meal_plans')
    .insert({ user_id: user.id, name, meals, rda_selection })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SavedMealPlan
}

export async function updateMealPlan(
  id: string,
  name: string,
  meals: Meal[],
  rda_selection: string
): Promise<void> {
  const { error } = await supabase
    .from('meal_plans')
    .update({ name, meals, rda_selection, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteMealPlan(id: string): Promise<void> {
  await nullSourceId(id)

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
