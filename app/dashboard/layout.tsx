import type { Metadata } from 'next'
import { LenisSWRProvider } from './LenisSWRProvider'

export const metadata: Metadata = {
  title: 'Dashboard — Gacha Resin Tracker',
  description: 'Pantau status resin semua akun game gacha kamu dalam satu tempat.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisSWRProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        {children}
      </div>
    </LenisSWRProvider>
  )
}
