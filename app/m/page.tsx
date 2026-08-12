import { fetchAppData } from '@/lib/fetchAppData'
import MobileShell from '@/components/mobile/MobileShell'

export const revalidate = 300

export default async function MobileHome() {
  const data = await fetchAppData()
  return <MobileShell data={data} />
}
