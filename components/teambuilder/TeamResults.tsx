'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScoredTeam } from '@/lib/teambuilder/types'
import { TeamCard } from './TeamCard'
import { cn } from '@/lib/utils'
import { Trophy, Sparkles, Coins, Grid3x3 } from 'lucide-react'

interface TeamResultsProps {
  teams: ScoredTeam[]
}

const tabs = [
  { id: 'meta',  label: 'Meta',        icon: <Trophy className="w-3.5 h-3.5" />,    accent: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'niche', label: 'Niche',       icon: <Sparkles className="w-3.5 h-3.5" />,  accent: 'text-purple-400',border: 'border-purple-500/30',bg: 'bg-purple-500/10' },
  { id: 'f2p',   label: 'F2P',         icon: <Coins className="w-3.5 h-3.5" />,     accent: 'text-emerald-400',border:'border-emerald-500/30',bg:'bg-emerald-500/10' },
  { id: 'all',   label: 'Semua',       icon: <Grid3x3 className="w-3.5 h-3.5" />,   accent: 'text-blue-400',  border: 'border-blue-500/30',  bg: 'bg-blue-500/10' },
] as const

type TabId = typeof tabs[number]['id']

export function TeamResults({ teams }: TeamResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('meta')

  const metaTeams  = useMemo(() => teams.filter(t => t.category === 'meta'),    [teams])
  const nicheTeams = useMemo(() => teams.filter(t => t.category === 'niche'),   [teams])
  const f2pTeams   = useMemo(() => teams.filter(t => t.category === 'f2p'),     [teams])
  const allTeams   = useMemo(() => [...teams],                                   [teams])

  const teamsByTab: Record<TabId, ScoredTeam[]> = {
    meta: metaTeams,
    niche: nicheTeams,
    f2p: f2pTeams,
    all: allTeams,
  }

  const countByTab: Record<TabId, number> = {
    meta: metaTeams.length,
    niche: nicheTeams.length,
    f2p: f2pTeams.length,
    all: allTeams.length,
  }

  const fallbacks: Record<TabId, string> = {
    meta: 'Tidak ada tim yang masuk kategori Meta kuat untuk konten ini.',
    niche: 'Tidak ada tim Niche dengan sinergi unik yang terdeteksi.',
    f2p: 'Tidak ada tim dominan 4★ / F2P yang valid.',
    all: 'Tidak ada tim yang valid ditemukan.',
  }

  if (teams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-20 px-6 border border-dashed border-white/10 rounded-2xl text-center"
      >
        <div className="text-5xl opacity-30">⚔️</div>
        <div>
          <p className="font-semibold text-foreground/70 mb-1">Tidak ada kombinasi tim yang valid</p>
          <p className="text-sm text-muted-foreground/60 max-w-xs leading-relaxed">
            Pastikan Anda memiliki minimal 4 karakter di roster dengan setidaknya 1 DPS atau Sub-DPS.
          </p>
        </div>
      </motion.div>
    )
  }

  const currentTab = tabs.find(t => t.id === activeTab)!

  return (
    <div className="space-y-5">
      {/* Custom tab bar */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/8">
        {tabs.map(tab => {
          const isActive = tab.id === activeTab
          const count = countByTab[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
                isActive
                  ? cn("text-foreground shadow-sm", tab.bg, tab.border, "border")
                  : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/[0.03]"
              )}
            >
              <span className={isActive ? tab.accent : ''}>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] font-mono px-1 rounded",
                isActive ? cn("text-foreground/70", tab.bg) : "text-muted-foreground/30"
              )}>
                {count}
              </span>

              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className={cn("absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full", currentTab.accent.replace('text-', 'bg-').replace('-400', '-500/60'))}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Results grid with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <TeamGrid
            teams={activeTab === 'all' ? allTeams.slice(0, 30) : teamsByTab[activeTab].slice(0, 10)}
            fallbackMsg={fallbacks[activeTab]}
          />
          {activeTab === 'all' && allTeams.length > 30 && (
            <p className="text-center text-[11px] text-muted-foreground/40 mt-4 font-mono">
              Menampilkan 30 / {allTeams.length} kombinasi tim teratas
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TeamGrid({ teams, fallbackMsg }: { teams: ScoredTeam[]; fallbackMsg: string }) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground/50 bg-white/[0.015] rounded-2xl border border-white/5">
        {fallbackMsg}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {teams.map((team, idx) => (
        <TeamCard key={idx} teamData={team} index={idx} />
      ))}
    </div>
  )
}
