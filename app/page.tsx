import { fetchHeatmapData } from '@/lib/fetchHeatmapData'
import AppShell from '@/components/AppShell'

export const revalidate = 300

export default async function Home() {
  const data = await fetchHeatmapData()
  return <AppShell data={data} />
}
