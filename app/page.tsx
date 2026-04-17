import { fetchHeatmapData } from '@/lib/fetchHeatmapData'
import MainView from '@/components/MainView'
import AuthButton from '@/components/AuthButton'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await fetchHeatmapData()

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Nutrition Platform</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {data.foods.length} foods · {data.nutrients.length} nutrients · values per 100 g raw
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500 hidden sm:block">
              Click any column header to sort · Hover a cell for exact value
            </p>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-2">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-4 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Colour scale:</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: 'hsl(142,76%,28%)' }} />
            High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-slate-600" />
            Mid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0,72%,42%)' }} />
            Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-slate-600 opacity-50" />
            No data
          </span>
          <span className="text-slate-500">— scale normalised within each column</span>
        </div>
      </div>

      {/* Main content */}
      <section className="px-4 py-5 max-w-screen-2xl mx-auto">
        <MainView data={data} />
      </section>
    </main>
  )
}
