import { Metadata } from 'next'
import Link from 'next/link'
import { Zap, ChevronLeft } from 'lucide-react'
import { ResinCalculator } from '@/components/calculator/ResinCalculator'

export const metadata: Metadata = {
  title: 'Kalkulator | Resin Tracker',
  description: 'Hitung pemakaian resin, waktu tunggu, dan estimasi refresh dengan mudah.',
}

export default function CalculatorPage() {
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
                <Zap className="h-4 w-4 text-[--accent-primary]" />
              </div>
              <span className="font-semibold text-[--text-primary]">Kalkulator</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[--text-primary]">Kalkulator Resin</h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            Rencanakan aktivitas harianmu dan hitung waktu yang dibutuhkan hingga resin penuh.
          </p>
        </div>

        <ResinCalculator />
      </main>
    </div>
  )
}
