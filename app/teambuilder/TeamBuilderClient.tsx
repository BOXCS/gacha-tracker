'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  useEffect(() => {
    if (!selectedAccountId && accounts && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
  }, [accounts, selectedAccountId])

  const selectedAccount = accounts?.find(a => a.id === selectedAccountId)
  const { roster, isLoading: rosterLoading } = useRoster(selectedAccountId)
  
  const allGameCharacters = React.useMemo(() => {
    return selectedAccount ? getCharactersByGame(selectedAccount.game_type as GameType) : []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount?.game_type])

  const ownedCharacters = React.useMemo(() => {
    if (!roster || !allGameCharacters.length) return []
    const ownedIds = new Set(roster.filter(r => r.owned).map(r => r.character_id))
    return allGameCharacters.filter(c => ownedIds.has(c.id))
  }, [roster, allGameCharacters])

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
          4,
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

    const timerId = setTimeout(() => { runCombinator() }, 50)
    return () => { isCancelled = true; clearTimeout(timerId) }
  }, [ownedCharacters, selectedContentType, selectedAccount, rosterLoading])


  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        <span className="text-sm font-mono animate-pulse">Memuat akun...</span>
      </div>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-6 border border-dashed border-purple-500/20 rounded-2xl bg-purple-500/5"
      >
        <div className="text-4xl mb-4">⚔️</div>
        <p className="font-semibold text-foreground mb-2">Belum ada akun game</p>
        <p className="text-sm text-muted-foreground">
          Tambahkan akun di halaman Dashboard terlebih dahulu untuk mulai menggunakan Team Recommender.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <ContentSelector 
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
        selectedContentType={selectedContentType}
        onContentTypeChange={setSelectedContentType}
        isCalculating={isCalculating}
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left: Roster Summary */}
        <div className="w-full md:w-56 shrink-0">
          <RosterSummary 
            accountId={selectedAccountId}
            ownedCount={ownedCharacters.length}
            totalGameCharacters={allGameCharacters.length}
          />
        </div>

        {/* Right: Results */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {rosterLoading ? (
              <motion.div
                key="roster-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-32 gap-3 text-muted-foreground"
              >
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <span className="text-sm font-mono animate-pulse">Memuat roster...</span>
              </motion.div>
            ) : isCalculating ? (
              <motion.div
                key="calculating"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center py-24 gap-6 rounded-2xl border border-purple-500/15 bg-purple-500/5 relative overflow-hidden"
              >
                {/* Background pulse ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border border-purple-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                </div>

                <div className="relative flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Mengkalkulasi kombinasi tim...</p>
                  <p className="text-xs text-muted-foreground font-mono">{progress}% selesai</p>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <TeamResults teams={scoredTeams} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
