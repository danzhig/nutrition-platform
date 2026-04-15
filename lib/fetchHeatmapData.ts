import { supabase } from './supabase'
import type { HeatmapData, FoodRow, NutrientMeta } from '@/types/nutrition'

const PAGE_SIZE = 1000

export async function fetchHeatmapData(): Promise<HeatmapData> {
  // Supabase defaults to 1,000 rows per request. Paginate to fetch all 8,268 rows.
  let allRows: any[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('food_nutrients')
      .select(`
        food_id,
        value_per_100g,
        foods (
          id,
          name,
          food_categories ( name )
        ),
        nutrients (
          id,
          name,
          unit,
          nutrient_categories ( name )
        )
      `)
      .order('food_id')
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw new Error(`Supabase query failed: ${error.message}`)
    if (!data || data.length === 0) break

    allRows = allRows.concat(data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const data = allRows
  if (data.length === 0) throw new Error('No data returned from Supabase')

  // Reshape flat rows into structured HeatmapData
  const foodMap = new Map<number, FoodRow>()
  const nutrientMap = new Map<number, NutrientMeta>()
  const columnValues = new Map<number, number[]>() // all non-null values per nutrient column

  for (const row of data as any[]) {
    const food = row.foods
    const nutrient = row.nutrients
    const value: number | null = row.value_per_100g

    const foodId: number = row.food_id
    const nutrientId: number = nutrient.id

    // Build nutrient metadata map
    if (!nutrientMap.has(nutrientId)) {
      nutrientMap.set(nutrientId, {
        nutrient_id: nutrientId,
        nutrient_name: nutrient.name,
        unit: nutrient.unit,
        nutrient_category: nutrient.nutrient_categories?.name ?? 'Other',
      })
    }

    // Build food row map
    if (!foodMap.has(foodId)) {
      foodMap.set(foodId, {
        food_id: foodId,
        food_name: food.name,
        category: food.food_categories?.name ?? 'Other',
        nutrients: {},
      })
    }
    foodMap.get(foodId)!.nutrients[nutrientId] = value

    // Collect non-null values for percentile calculation
    if (value !== null && value !== undefined) {
      if (!columnValues.has(nutrientId)) columnValues.set(nutrientId, [])
      columnValues.get(nutrientId)!.push(value)
    }
  }

  // Compute p10/p90 per column — prevents outliers from monopolising the colour scale.
  // Values below p10 clamp to deepest red; values above p90 clamp to deepest green.
  const columnRanges: Record<number, { min: number; max: number }> = {}
  for (const [id, values] of columnValues) {
    values.sort((a, b) => a - b)
    columnRanges[id] = {
      min: percentile(values, 10),
      max: percentile(values, 90),
    }
  }

  return {
    foods: Array.from(foodMap.values()),
    nutrients: Array.from(nutrientMap.values()),
    columnRanges,
  }
}

/** Linear-interpolation percentile on a pre-sorted array. */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}
