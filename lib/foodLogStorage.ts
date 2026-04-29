import { supabase } from './supabase'
import type { FoodLogEntry, FoodLogItem, NewFoodLogEntry } from '@/types/calendar'

export async function getEntriesForDateRange(
  startDate: string,
  endDate: string
): Promise<FoodLogEntry[]> {
  const { data, error } = await supabase
    .from('food_log')
    .select('*')
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as FoodLogEntry[]
}

export async function addEntry(entry: NewFoodLogEntry): Promise<FoodLogEntry> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('food_log')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as FoodLogEntry
}

// Updates amount_g for a single item within an entry's items array.
// Uses (food_id, meal_label) to locate the item — the combination is unique within any valid log entry.
export async function updateEntryItemGrams(
  entryId: string,
  foodId: number,
  mealLabel: string | undefined,
  newGrams: number
): Promise<void> {
  const { data: row, error: fetchError } = await supabase
    .from('food_log')
    .select('items')
    .eq('id', entryId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const updatedItems = (row.items as FoodLogItem[]).map(item =>
    item.food_id === foodId && item.meal_label === mealLabel
      ? { ...item, amount_g: newGrams }
      : item
  )

  const { error: updateError } = await supabase
    .from('food_log')
    .update({ items: updatedItems })
    .eq('id', entryId)

  if (updateError) throw new Error(updateError.message)
}

export async function deleteEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('food_log')
    .delete()
    .eq('id', entryId)

  if (error) throw new Error(error.message)
}

// Called by mealStorage and savedMealStorage before deleting a source.
// Clears the soft reference so calendar history remains intact.
export async function nullSourceId(sourceId: string): Promise<void> {
  const { error } = await supabase
    .from('food_log')
    .update({ source_id: null })
    .eq('source_id', sourceId)

  if (error) throw new Error(error.message)
}
