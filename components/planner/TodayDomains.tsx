'use client'

import { useAccounts } from '@/hooks/useAccounts'
import { getTodayDomains } from '@/lib/planner'
import { getCurrentGameDate } from '@/lib/reset'
import { getGameConfig, type GameType } from '@/lib/games'
import { DomainCard } from './DomainCard'
import { Zap } from 'lucide-react'
import { computeResin } from '@/lib/resin'

export function TodayDomains() {
  const { accounts, isLoading } = useAccounts()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="h-32 rounded-xl bg-[--bg-surface-raised]" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-[--border-default] bg-[--bg-surface] p-8 text-center">
        <p className="text-[--text-muted]">Belum ada akun game yang ditambahkan.</p>
      </div>
    )
  }

  // Group accounts by game type
  const grouped = accounts.reduce((acc, account) => {
    if (!acc[account.game_type]) acc[account.game_type] = []
    acc[account.game_type].push(account)
    return acc
  }, {} as Record<GameType, typeof accounts>)

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([game, gameAccounts]) => {
        const gameType = game as GameType
        const config = getGameConfig(gameType)
        const gameDate = getCurrentGameDate(gameType)
        const domains = getTodayDomains(gameType)

        if (domains.length === 0) return null

        return (
          <div key={gameType} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[--border-default] pb-2">
              <h2 className="text-lg font-bold text-[--text-primary]">{config.name}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameAccounts.map(account => {
                const currentResin = computeResin(
                  account.current_resin,
                  account.max_resin,
                  account.last_updated_at,
                  config.regenRateSeconds,
                  new Date()
                )

                return (
                  <div key={account.id} className="rounded-xl border border-[--border-default] bg-[--bg-surface] p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-[--text-primary] truncate">{account.nickname}</h3>
                      <div className="flex items-center gap-1.5 rounded-full bg-[--accent-primary]/10 px-2.5 py-1 text-xs font-bold text-[--accent-primary]">
                        <Zap className="h-3 w-3" />
                        <span className="font-mono">{currentResin}</span>
                        <span className="text-[--text-muted] font-sans font-normal">/ {account.max_resin}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {domains.map(domain => (
                        <DomainCard 
                          key={domain.id}
                          domain={domain}
                          accountId={account.id}
                          gameDate={gameDate}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
