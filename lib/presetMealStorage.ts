import { supabase } from '@/lib/supabase'
import type { MealItem } from '@/types/meals'

export interface PresetMeal {
  id: string
  name: string
  category: string
  description: string | null
  items: MealItem[]
  created_at: string
}

export async function loadPresetMeals(): Promise<PresetMeal[]> {
  const { data, error } = await supabase
    .from('preset_meals')
    .select('*')
    .order('category')
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as PresetMeal[]
}
