'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Database } from '@/supabase/types'
import type { ContentType } from '@/lib/teambuilder/types'
import { ChevronDown, Gamepad2, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

type GameAccount = Database['public']['Tables']['game_accounts']['Row']

interface ContentSelectorProps {
  accounts: GameAccount[]
  selectedAccountId: string | null
  onAccountChange: (accountId: string) => void
  selectedContentType: ContentType
  onContentTypeChange: (content: ContentType) => void
  isCalculating: boolean
}

const contentByGame: Record<string, { value: ContentType, label: string, emoji: string }[]> = {
  genshin: [
    { value: 'spiral_abyss', label: 'Spiral Abyss', emoji: '🌀' },
    { value: 'imaginarium_theater', label: 'Imaginarium Theater', emoji: '🎭' },
    { value: 'overworld', label: 'Overworld / Eksplorasi', emoji: '🗺️' },
    { value: 'domain', label: 'Domain Farming', emoji: '🏯' },
  ],
  hsr: [
    { value: 'memory_of_chaos', label: 'Memory of Chaos', emoji: '🌌' },
    { value: 'pure_fiction', label: 'Pure Fiction', emoji: '📖' },
    { value: 'apocalyptic_shadow', label: 'Apocalyptic Shadow', emoji: '🌑' },
  ],
  zzz: [
    { value: 'shiyu_defense', label: 'Shiyu Defense', emoji: '🛡️' },
    { value: 'deadly_assault', label: 'Deadly Assault', emoji: '⚡' },
  ],
  wuwa: [
    { value: 'tower_of_adversity', label: 'Tower of Adversity', emoji: '🗼' }
  ],
  nte: [
    { value: 'nte_endgame', label: 'NTE Endgame', emoji: '🔮' }
  ],
  endfield: [
    { value: 'endfield_endgame', label: 'Endfield Endgame', emoji: '⚙️' }
  ]
}

const gameLabels: Record<string, { label: string; color: string }> = {
  genshin: { label: 'Genshin Impact', color: 'from-sky-400 to-blue-500' },
  hsr: { label: 'Honkai: Star Rail', color: 'from-amber-400 to-orange-500' },
  zzz: { label: 'Zenless Zone Zero', color: 'from-yellow-400 to-amber-500' },
  wuwa: { label: 'Wuthering Waves', color: 'from-emerald-400 to-teal-500' },
  nte: { label: 'Neverness to Everness', color: 'from-pink-400 to-rose-500' },
  endfield: { label: 'Arknights: Endfield', color: 'from-red-400 to-rose-600' },
}

function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  disabled,
  icon,
  label,
}: {
  value: T | null
  onChange: (v: T) => void
  options: { value: T; label: string; emoji?: string; sub?: string }[]
  disabled?: boolean
  icon?: React.ReactNode
  label: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="flex-1 relative">
      <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/60 mb-2 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
          "bg-white/[0.03] border-white/10 text-foreground",
          "hover:bg-white/[0.06] hover:border-purple-500/30 focus:outline-none focus:border-purple-500/40",
          open && "border-purple-500/40 bg-white/[0.06]",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.emoji && <span>{selected.emoji}</span>}
          <span className="truncate">{selected?.label || 'Pilih...'}</span>
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 top-full mt-2 w-full rounded-xl border border-white/10 bg-[#111] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {options.map((opt, i) => (
              <motion.button
                key={opt.value}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
                  "hover:bg-purple-500/10 hover:text-purple-300",
                  opt.value === value ? "text-purple-400 bg-purple-500/10" : "text-muted-foreground"
                )}
              >
                {opt.emoji && <span className="text-base">{opt.emoji}</span>}
                <span className="flex-1">{opt.label}</span>
                {opt.value === value && <span className="text-purple-400 text-xs">●</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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
    ? contentByGame[selectedAccount.game_type] || [{ value: 'general' as ContentType, label: 'General', emoji: '🎮' }]
    : []



  // Display nickname as sub-label
  const accountOptionsWithNick = accounts.map(acc => ({
    value: acc.id,
    label: `${gameLabels[acc.game_type]?.label ?? acc.game_type.toUpperCase()} · ${acc.nickname}`,
    emoji: '🎮',
  }))

  const selectedAccInfo = selectedAccount
    ? gameLabels[selectedAccount.game_type]
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative p-5 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
    >
      {/* Gradient accent line at top */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[1px]",
        selectedAccInfo
          ? `bg-gradient-to-r ${selectedAccInfo.color}`
          : "bg-gradient-to-r from-purple-500/60 via-violet-400/40 to-transparent"
      )} />

      <div className="flex flex-col sm:flex-row gap-4 relative">
        <CustomSelect
          value={selectedAccountId}
          onChange={onAccountChange}
          options={accountOptionsWithNick}
          disabled={isCalculating}
          icon={<Gamepad2 className="w-3.5 h-3.5" />}
          label="Akun Game"
        />
        <div className="hidden sm:flex items-end pb-3">
          <div className="w-px h-10 bg-white/10" />
        </div>
        <CustomSelect
          value={selectedContentType}
          onChange={onContentTypeChange}
          options={availableContents}
          disabled={isCalculating || !selectedAccount}
          icon={<Target className="w-3.5 h-3.5" />}
          label="Target Konten"
        />
      </div>
    </motion.div>
  )
}
