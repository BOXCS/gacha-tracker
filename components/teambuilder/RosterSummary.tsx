import React from 'react'
import Link from 'next/link'
import { Users, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RosterSummaryProps {
  accountId: string | null
  ownedCount: number
  totalGameCharacters: number
}

export function RosterSummary({ accountId, ownedCount, totalGameCharacters }: RosterSummaryProps) {
  if (!accountId) return null

  const percentage = totalGameCharacters > 0 ? Math.round((ownedCount / totalGameCharacters) * 100) : 0
  const isShort = ownedCount < 4 // Kurang dari 1 tim penuh

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card/30 backdrop-blur-sm h-fit sticky top-24">
      <div className="flex items-center gap-2 text-primary font-bold">
        <Users className="w-5 h-5" />
        <h3>Roster Summary</h3>
      </div>
      
      <div>
        <p className="text-3xl font-black">
          {ownedCount} <span className="text-sm font-medium text-muted-foreground">/ {totalGameCharacters}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Karakter Dimiliki ({percentage}%)</p>
      </div>

      {isShort && (
        <div className="flex gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-500 text-xs mt-2 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>Anda belum menandai cukup karakter untuk menyusun tim yang valid. Tim butuh minimal 4 karakter.</p>
        </div>
      )}

      <div className="mt-2 pt-4 border-t border-white/5">
        <Link href={`/roster?accountId=${accountId}`} className="block">
          <Button variant="outline" className="w-full text-xs">
            Update Roster
          </Button>
        </Link>
      </div>
    </div>
  )
}
