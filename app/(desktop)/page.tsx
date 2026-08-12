import { fetchAppData } from '@/lib/fetchAppData'
import AppShell from '@/components/AppShell'

export const revalidate = 300

export default async function Home() {
  const data = await fetchAppData()
  return <AppShell data={data} />
}
