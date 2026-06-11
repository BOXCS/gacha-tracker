import { Metadata } from 'next'
import TeamBuilderClient from './TeamBuilderClient'

export const metadata: Metadata = {
  title: 'Team Recommender | Gacha Resin Tracker',
  description: 'Dapatkan rekomendasi tim otomatis berdasarkan karakter yang Anda miliki.',
}

export default function TeamBuilderPage() {
  return (
    <div className="container max-w-6xl py-8 mt-16 px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Recommender</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Rules Engine akan mengevaluasi kombinasi karakter di roster Anda untuk 
          memberikan rekomendasi tim terbaik secara instan dan tanpa lag.
        </p>
      </div>

      <TeamBuilderClient />
    </div>
  )
}
