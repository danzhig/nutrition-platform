import type { Metadata, Viewport } from 'next'
import './mobile.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
}

export const metadata: Metadata = {
  title: 'Nutrition',
  manifest: '/m/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Nutrition',
    statusBarStyle: 'black-translucent',
  },
  icons: { apple: '/apple-touch-icon.png' },
}

export default function MobileLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="min-h-full bg-slate-900 text-slate-100">{children}</div>
}
