import { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import TeamBuilderClient from './TeamBuilderClient'

export const metadata: Metadata = {
  title: 'Team Recommender | Gacha Resin Tracker',
  description: 'Dapatkan rekomendasi tim otomatis berdasarkan karakter yang Anda miliki.',
}

export default function TeamBuilderPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Ambient Background ── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px]" />
      </div>

      <div className="container max-w-6xl py-10 mt-16 px-4 md:px-8 space-y-10">
        {/* ── Hero Header ── */}
        <div className="relative">
          {/* Decorative line */}
          <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-purple-500/60 to-transparent hidden md:block" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-purple-500/15 text-purple-400 border border-purple-500/25">
                ✦ Rules Engine
              </span>
              <span className="text-[11px] text-muted-foreground/60 font-mono">v6.0</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              <span className="text-foreground">Team</span>{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-blue-400">
                  Recommender
                </span>
                {/* Glow underline */}
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/60 via-violet-400/40 to-transparent" />
              </span>
            </h1>

            <p className="text-muted-foreground/70 text-sm max-w-lg leading-relaxed">
              Rules Engine mengevaluasi setiap kombinasi karakter di roster Anda secara instan — 
              <em className="text-foreground/80 not-italic"> tanpa server, tanpa lag</em>.
            </p>
          </div>
        </div>

        {/* ── Client Component ── */}
        <Suspense fallback={
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        }>
          <TeamBuilderClient />
        </Suspense>
      </div>
    </div>
  )
}
