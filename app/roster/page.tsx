import { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import RosterClient from './RosterClient'

export const metadata: Metadata = {
  title: 'Kelola Roster Karakter | Gacha Resin Tracker',
  description: 'Atur daftar karakter yang Anda miliki per akun untuk rekomendasi tim.',
}

export default function RosterPage() {
  return (
    <div className="container max-w-6xl py-8 mt-16 px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Roster Karakter</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Tandai karakter yang Anda miliki untuk masing-masing akun. Data kepemilikan ini akan 
          digunakan oleh Team Builder untuk merekomendasikan komposisi tim yang optimal.
        </p>
      </div>

      <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <RosterClient />
      </Suspense>
    </div>
  )
}
