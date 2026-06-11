'use client'

import React, { useState, useEffect } from 'react'
import { useAccounts } from '@/hooks/useAccounts'
import { useRoster } from '@/hooks/useRoster'
import { getCharactersByGame } from '@/data/characters'
import { generateTeamCombinations } from '@/lib/teambuilder/combinator'
import type { ContentType, ScoredTeam } from '@/lib/teambuilder/types'
import type { GameType } from '@/lib/games'
import { ContentSelector } from '@/components/teambuilder/ContentSelector'
import { RosterSummary } from '@/components/teambuilder/RosterSummary'
import { TeamResults } from '@/components/teambuilder/TeamResults'
import { Loader2 } from 'lucide-react'

export default function TeamBuilderClient() {
  const { accounts, isLoading: accountsLoading } = useAccounts()
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('general')
  
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scoredTeams, setScoredTeams] = useState<ScoredTeam[]>([])

  // Auto-select first account if none selected
  useEffect(() => {
    if (!selectedAccountId && accounts && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
  }, [accounts, selectedAccountId])

  // Get selected account info
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId)
  const { roster, isLoading: rosterLoading } = useRoster(selectedAccountId)
  
  // Game chars and owned chars
  const allGameCharacters = React.useMemo(() => {
    return selectedAccount ? getCharactersByGame(selectedAccount.game_type as GameType) : []
  }, [selectedAccount?.game_type])
  const ownedCharacters = React.useMemo(() => {
    if (!roster || !allGameCharacters.length) return []
    const ownedIds = new Set(roster.filter(r => r.owned).map(r => r.character_id))
    return allGameCharacters.filter(c => ownedIds.has(c.id))
  }, [roster, allGameCharacters])

  // Run calculation when owned characters or content type changes
  useEffect(() => {
    if (!selectedAccount || rosterLoading) return
    
    let isCancelled = false
    setIsCalculating(true)
    setProgress(0)
    setScoredTeams([])

    const runCombinator = async () => {
      try {
        const teams = await generateTeamCombinations(
          ownedCharacters, 
          selectedContentType, 
          4, // Team size, bisa disesuaikan nanti per game
          (prog) => {
            if (!isCancelled) setProgress(prog)
          }
        )
        if (!isCancelled) {
          setScoredTeams(teams)
        }
      } catch (err) {
        console.error('Failed to generate teams', err)
      } finally {
        if (!isCancelled) {
          setIsCalculating(false)
          setProgress(100)
        }
      }
    }

    // Delay slightly so UI can render loading state
    const timerId = setTimeout(() => {
      runCombinator()
    }, 50)

    return () => {
      isCancelled = true
      clearTimeout(timerId)
    }
  }, [ownedCharacters, selectedContentType, selectedAccount, rosterLoading])


  if (accountsLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-card/30">
        Anda belum memiliki akun game. Silakan tambahkan akun di Dashboard terlebih dahulu.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ContentSelector 
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
        selectedContentType={selectedContentType}
        onContentTypeChange={setSelectedContentType}
        isCalculating={isCalculating}
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Column: Summary */}
        <div className="w-full md:w-64 shrink-0">
          <RosterSummary 
            accountId={selectedAccountId}
            ownedCount={ownedCharacters.length}
            totalGameCharacters={allGameCharacters.length}
          />
        </div>

        {/* Right Column: Results */}
        <div className="flex-1 min-w-0">
          {rosterLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : isCalculating ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4 bg-card/10 rounded-xl border border-white/5">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Mengkalkulasi ribuan kombinasi tim...</p>
              <div className="w-64 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-200" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          ) : (
            <TeamResults teams={scoredTeams} />
          )}
        </div>
      </div>
    </div>
  )
}
