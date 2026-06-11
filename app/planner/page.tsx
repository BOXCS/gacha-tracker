import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, ChevronLeft } from 'lucide-react'
import { TodayDomains } from '@/components/planner/TodayDomains'

export const metadata: Metadata = {
  title: 'Farming Planner | Resin Tracker',
  description: 'Rencanakan farming harian material karakter dan senjata.',
}

export default function PlannerPage() {
  const hariIni = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date())

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <header className="sticky top-0 z-30 border-b border-[--border-default]/60 bg-[rgba(var(--bg-base-rgb),0.9)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md p-1.5 text-[--text-muted] transition-colors hover:bg-[--bg-surface-raised] hover:text-[--text-primary]"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline font-medium text-sm">Kembali</span>
            </Link>
            <div className="h-4 w-px bg-[--border-default]" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[--accent-primary]/10">
                <Calendar className="h-4 w-4 text-[--accent-primary]" />
              </div>
              <span className="font-semibold text-[--text-primary]">Planner</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[--text-primary]">Farming Harian</h1>
            <p className="mt-1 text-sm text-[--text-muted]">
              Daftar material dan aktivitas yang tersedia untuk di-farm hari ini.
            </p>
          </div>
          <div className="inline-flex items-center rounded-lg bg-[--bg-surface-raised] border border-[--border-default] px-3 py-1.5 text-sm font-medium text-[--text-primary]">
            Hari: <span className="ml-1 font-bold text-[--accent-primary]">{hariIni}</span>
          </div>
        </div>

        <TodayDomains />
      </main>
    </div>
  )
}
