import React from 'react'
import type { Database } from '@/supabase/types'
import type { ContentType } from '@/lib/teambuilder/types'

type GameAccount = Database['public']['Tables']['game_accounts']['Row']

interface ContentSelectorProps {
  accounts: GameAccount[]
  selectedAccountId: string | null
  onAccountChange: (accountId: string) => void
  selectedContentType: ContentType
  onContentTypeChange: (content: ContentType) => void
  isCalculating: boolean
}

// Mapping konten per game
const contentByGame: Record<string, { value: ContentType, label: string }[]> = {
  genshin: [
    { value: 'spiral_abyss', label: 'Spiral Abyss' },
    { value: 'imaginarium_theater', label: 'Imaginarium Theater' },
    { value: 'overworld', label: 'Overworld / Eksplorasi' },
    { value: 'domain', label: 'Domain Farming' },
  ],
  hsr: [
    { value: 'memory_of_chaos', label: 'Memory of Chaos' },
    { value: 'pure_fiction', label: 'Pure Fiction' },
    { value: 'apocalyptic_shadow', label: 'Apocalyptic Shadow' },
  ],
  zzz: [
    { value: 'shiyu_defense', label: 'Shiyu Defense' },
    { value: 'deadly_assault', label: 'Deadly Assault' },
  ],
  wuwa: [
    { value: 'tower_of_adversity', label: 'Tower of Adversity' }
  ],
  nte: [
    { value: 'nte_endgame', label: 'NTE Endgame' }
  ],
  endfield: [
    { value: 'endfield_endgame', label: 'Endfield Endgame' }
  ]
}

export function ContentSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
  selectedContentType,
  onContentTypeChange,
  isCalculating
}: ContentSelectorProps) {
  
  const selectedAccount = accounts.find(a => a.id === selectedAccountId)
  const availableContents = selectedAccount 
    ? contentByGame[selectedAccount.game_type] || [{ value: 'general', label: 'General' }]
    : []

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-card/30 backdrop-blur-sm">
      <div className="flex-1">
        <label className="block text-sm font-semibold mb-1 text-muted-foreground">Pilih Akun Game</label>
        <select 
          value={selectedAccountId || ''}
          onChange={(e) => onAccountChange(e.target.value)}
          disabled={isCalculating}
          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.game_type.toUpperCase()} - {acc.nickname}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-semibold mb-1 text-muted-foreground">Pilih Target Konten</label>
        <select 
          value={selectedContentType}
          onChange={(e) => onContentTypeChange(e.target.value as ContentType)}
          disabled={isCalculating || !selectedAccount}
          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          {availableContents.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
