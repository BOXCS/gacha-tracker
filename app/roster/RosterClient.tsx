'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAccounts } from '@/hooks/useAccounts'
import { useRoster } from '@/hooks/useRoster'
import { getCharactersByGame } from '@/data/characters'
import { CharacterGrid } from '@/components/roster/CharacterGrid'
import { Loader2 } from 'lucide-react'
import type { GameType } from '@/lib/games'

export default function RosterClient() {
  const searchParams = useSearchParams()
  const initialAccountId = searchParams.get('accountId')
  
  const { accounts, isLoading: accountsLoading } = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialAccountId)

  // Auto-select first account if none selected
  useEffect(() => {
    if (!selectedAccountId && accounts && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
  }, [accounts, selectedAccountId])

  const selectedAccount = accounts?.find(a => a.id === selectedAccountId)
  
  const { roster, isLoading: rosterLoading, updateCharacter } = useRoster(selectedAccountId)

  if (accountsLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-card/30">
        Anda belum memiliki akun game. Silakan tambahkan akun di Dashboard terlebih dahulu.
      </div>
    )
  }

  const characters = selectedAccount ? getCharactersByGame(selectedAccount.game_type as GameType) : []

  return (
    <div className="space-y-8">
      {/* Account Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-xl border bg-card/30">
        <label className="text-sm font-semibold shrink-0">Pilih Akun:</label>
        <select 
          value={selectedAccountId || ''}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="flex-1 max-w-sm h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.game_type.toUpperCase()} - {acc.nickname}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      {rosterLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : characters.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card/30 text-muted-foreground">
          Data karakter untuk game ini belum tersedia.
        </div>
      ) : (
        <CharacterGrid 
          characters={characters} 
          roster={roster} 
          onUpdateCharacter={updateCharacter}
        />
      )}
    </div>
  )
}
