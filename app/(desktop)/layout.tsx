'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DesktopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    if (window.innerWidth < 768) {
      router.replace('/m');
    }
  }, [router]);

  return (
    <>
      {/* Redirect notice — hidden on md+ screens, shown briefly while the mobile redirect above fires */}
      <div className="md:hidden fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <p className="text-slate-400 text-sm leading-relaxed">Opening the mobile app…</p>
        <a href="/m" className="mt-2 inline-block rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
          Open the mobile app →
        </a>
      </div>
      {/* Main app — hidden on mobile so it doesn't render behind the gate */}
      <div className="hidden md:contents">
        {children}
      </div>
    </>
  );
}
