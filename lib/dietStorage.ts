import { supabase } from '@/lib/supabase'

export interface DietFood {
  foodId: number
  daysPerWeek: number // 1–7
}

// Maps legacy rating (1–5) to the nearest days-per-week value
const LEGACY_RATING_TO_DAYS: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 6, 5: 7 }

function migrateEntries(raw: unknown[]): DietFood[] {
  return raw.map((entry: any) => {
    if (typeof entry.daysPerWeek === 'number') return entry as DietFood
    const days = LEGACY_RATING_TO_DAYS[entry.rating as number] ?? 4
    return { foodId: entry.foodId as number, daysPerWeek: days }
  })
}

const LS_KEY = 'np:diet:foods'

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function fetchFromSupabase(userId: string): Promise<DietFood[] | null> {
  const { data, error } = await supabase
    .from('user_diet_lists')
    .select('foods')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.foods as DietFood[]
}

async function upsertToSupabase(userId: string, foods: DietFood[]): Promise<void> {
  await supabase.from('user_diet_lists').upsert(
    { user_id: userId, foods, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Load diet list. If userId is provided and Supabase returns data, that wins.
 * Falls back to localStorage for guests or on network error.
 */
export async function loadDietList(userId?: string): Promise<DietFood[]> {
  if (userId) {
    const remote = await fetchFromSupabase(userId)
    if (remote !== null) {
      const migrated = migrateEntries(remote)
      try { localStorage.setItem(LS_KEY, JSON.stringify(migrated)) } catch { /* ignore */ }
      return migrated
    }
  }
  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return migrateEntries(JSON.parse(raw))
  } catch { /* ignore */ }
  return []
}

/**
 * Save diet list. Always writes localStorage immediately; if userId provided,
 * fires an async Supabase upsert (non-blocking).
 */
export function saveDietList(foods: DietFood[], userId?: string): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(foods)) } catch { /* ignore */ }
  if (userId) {
    upsertToSupabase(userId, foods).catch(console.error)
  }
}

/** Clear the local diet list (called on logout). */
export function clearLocalDietList(): void {
  try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
}
