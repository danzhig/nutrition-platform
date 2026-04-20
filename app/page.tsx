import { fetchHeatmapData } from '@/lib/fetchHeatmapData'
import MainView from '@/components/MainView'
import AuthButton from '@/components/AuthButton'

export const revalidate = 300 // re-render at most every 5 minutes

export default async function Home() {
  const data = await fetchHeatmapData()

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Nutrition Platform</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {data.foods.length} foods · {data.nutrients.length} nutrients
            </p>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main content */}
      <section className="px-4 py-5 max-w-screen-2xl mx-auto">
        <MainView data={data} />
      </section>
    </main>
  )
}
