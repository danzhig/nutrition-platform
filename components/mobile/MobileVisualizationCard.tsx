'use client'

import { useRef, useState } from 'react'
import type { NutrientMeta, FoodRow } from '@/types/nutrition'
import type { Meal } from '@/types/meals'
import type { RDAProfile } from '@/lib/rdaProfiles'
import MacroDonutChart from '@/components/MacroDonutChart'
import MealCategoryRadar from '@/components/MealCategoryRadar'

interface MobileVisualizationCardProps {
  nutrients: NutrientMeta[]
  foodsById: Map<number, FoodRow>
  meals: Meal[]
  totals: Record<number, number>
  rdaProfile: RDAProfile
}

export default function MobileVisualizationCard({
  nutrients,
  foodsById,
  meals,
  totals,
  rdaProfile,
}: MobileVisualizationCardProps) {
  const [active, setActive] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    const el = scrollerRef.current
    if (!el || el.clientWidth === 0) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-lg"
        style={{ height: 260 }}
      >
        <div className="w-full h-full shrink-0 snap-center">
          <MacroDonutChart nutrients={nutrients} meals={meals} foodsById={foodsById} innerOnly />
        </div>
        <div className="w-full h-full shrink-0 snap-center">
          <MealCategoryRadar nutrients={nutrients} rdaProfile={rdaProfile} totals={totals} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {[0, 1].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${active === i ? 'bg-violet-400' : 'bg-slate-700'}`}
          />
        ))}
      </div>
    </div>
  )
}
