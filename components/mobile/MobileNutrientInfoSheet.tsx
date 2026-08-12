'use client'

import { useEffect, useState } from 'react'
import type { FoodRow, NutrientMeta } from '@/types/nutrition'
import MobileNutrientRanking from './MobileNutrientRanking'
import { useSwipeToDismiss } from './useSwipeToDismiss'

interface MobileNutrientInfoSheetProps {
  open: boolean
  onClose: () => void
  nutrientName: string | null
  allNutrients: NutrientMeta[]
  foods: FoodRow[]
  onSelectFood?: (food: FoodRow) => void
}

export default function MobileNutrientInfoSheet({
  open,
  onClose,
  nutrientName,
  allNutrients,
  foods,
  onSelectFood,
}: MobileNutrientInfoSheetProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    window.history.pushState({ sheet: true }, '')
    function onPopState() {
      onClose()
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function requestClose() {
    if (window.history.state?.sheet) {
      window.history.back()
    } else {
      onClose()
    }
  }

  const swipe = useSwipeToDismiss(requestClose)

  if (!open) return null

  const nutrient = allNutrients.find((n) => n.nutrient_name === nutrientName) ?? null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={requestClose} />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[80vh] flex flex-col rounded-t-2xl bg-slate-800 border-t border-slate-700 shadow-2xl transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', ...swipe.style }}
      >
        <div className="pt-2 pb-4 shrink-0 touch-none" {...swipe.handlers}>
          <div className="w-9 h-1 rounded-full bg-slate-600 mx-auto" />
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 pb-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
          <h2 className="text-base font-semibold text-slate-100 mb-4">
            {nutrient?.nutrient_name ?? nutrientName}
          </h2>

          {nutrient?.body_role && (
            <Section title="Function">{nutrient.body_role}</Section>
          )}
          {nutrient?.deficiency_symptoms && (
            <Section title="Too Little">{nutrient.deficiency_symptoms}</Section>
          )}
          {nutrient?.excess_symptoms && (
            <Section title="Too Much">{nutrient.excess_symptoms}</Section>
          )}

          {nutrient && (
            <div className="mt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Top Foods
              </h3>
              <MobileNutrientRanking
                nutrientId={nutrient.nutrient_id}
                foods={foods}
                unit="serving"
                limit={5}
                onSelectFood={(food) => {
                  onSelectFood?.(food)
                  requestClose()
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{children}</p>
    </div>
  )
}
