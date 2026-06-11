'use client'

import React, { useState, useMemo } from 'react'
import type { Character } from '@/lib/teambuilder/types'
import { CharacterCard } from './CharacterCard'
import { Search } from 'lucide-react'
import type { Database } from '@/supabase/types'

type UserRoster = Database['public']['Tables']['user_roster']['Row']

interface CharacterGridProps {
  characters: Character[]
  roster: UserRoster[]
  onUpdateCharacter: (characterId: string, owned: boolean, constellation: number) => void
}

export function CharacterGrid({ characters, roster, onUpdateCharacter }: CharacterGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterElement, setFilterElement] = useState<string>('all')

  // Derive unique elements from characters for filter dropdown
  const elements = useMemo(() => {
    const elSet = new Set(characters.map(c => c.element))
    return Array.from(elSet).sort()
  }, [characters])

  // Map roster for fast lookup O(1)
  const rosterMap = useMemo(() => {
    const map = new Map<string, UserRoster>()
    roster.forEach(r => map.set(r.character_id, r))
    return map
  }, [roster])

  // Filter characters
  const filteredCharacters = useMemo(() => {
    return characters.filter(c => {
      // 1. Search filter
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // 2. Element filter
      if (filterElement !== 'all' && c.element !== filterElement) {
        return false
      }
      return true
    })
  }, [characters, searchQuery, filterElement])

  // Sorting: Dimiliki lebih dulu, lalu rarity 5*, lalu abjad
  const sortedCharacters = useMemo(() => {
    return [...filteredCharacters].sort((a, b) => {
      const aOwned = rosterMap.get(a.id)?.owned ?? false
      const bOwned = rosterMap.get(b.id)?.owned ?? false

      if (aOwned && !bOwned) return -1
      if (!aOwned && bOwned) return 1

      if (a.rarity !== b.rarity) return b.rarity - a.rarity
      
      return a.name.localeCompare(b.name)
    })
  }, [filteredCharacters, rosterMap])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Cari karakter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-card/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
          />
        </div>
        
        <select 
          value={filterElement}
          onChange={(e) => setFilterElement(e.target.value)}
          className="flex h-10 items-center justify-between rounded-md border border-input bg-card/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">Semua Elemen</option>
          {elements.map(el => (
            <option key={el} value={el}>{el}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {sortedCharacters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Tidak ada karakter yang cocok dengan pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedCharacters.map(char => {
            const rosterData = rosterMap.get(char.id)
            const isOwned = rosterData?.owned ?? false
            const constellation = rosterData?.constellation ?? 0

            return (
              <CharacterCard
                key={char.id}
                character={char}
                owned={isOwned}
                constellation={constellation}
                onToggleOwned={() => onUpdateCharacter(char.id, !isOwned, constellation)}
                onChangeConstellation={(val) => onUpdateCharacter(char.id, isOwned, val)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
