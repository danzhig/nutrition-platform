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
  const columnMin = new Map<number, number>()
  const columnMax = new Map<number, number>()

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

    // Track column min/max (ignoring NULLs)
    if (value !== null && value !== undefined) {
      const currentMin = columnMin.get(nutrientId)
      const currentMax = columnMax.get(nutrientId)
      if (currentMin === undefined || value < currentMin) columnMin.set(nutrientId, value)
      if (currentMax === undefined || value > currentMax) columnMax.set(nutrientId, value)
    }
  }

  const columnRanges: Record<number, { min: number; max: number }> = {}
  for (const [id, min] of columnMin) {
    columnRanges[id] = { min, max: columnMax.get(id) ?? min }
  }

  return {
    foods: Array.from(foodMap.values()),
    nutrients: Array.from(nutrientMap.values()),
    columnRanges,
  }
}
