import React from 'react'
import type { ScoredTeam } from '@/lib/teambuilder/types'
import { cn } from '@/lib/utils'
import { Swords, Zap, Wand2, HeartPulse, Shield } from 'lucide-react'

interface TeamCardProps {
  teamData: ScoredTeam
}

const elementColors: Record<string, string> = {
  Pyro: 'from-orange-500/80 to-red-600/80',
  Hydro: 'from-blue-400/80 to-blue-600/80',
  Anemo: 'from-emerald-300/80 to-teal-500/80',
  Electro: 'from-purple-400/80 to-purple-600/80',
  Dendro: 'from-green-400/80 to-green-600/80',
  Cryo: 'from-cyan-300/80 to-cyan-500/80',
  Geo: 'from-amber-400/80 to-amber-600/80',
  Physical: 'from-gray-300/80 to-gray-500/80'
}

const roleIcons = {
  dps: <Swords className="w-3 h-3" />,
  sub_dps: <Zap className="w-3 h-3" />,
  support: <Wand2 className="w-3 h-3" />,
  healer: <HeartPulse className="w-3 h-3" />,
  shielder: <Shield className="w-3 h-3" />
}

export function TeamCard({ teamData }: TeamCardProps) {
  const { characters, score, category, reasonSummary } = teamData

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-white/10 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-colors">
      
      {/* Header: Score & Category */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {category === 'meta' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">Meta</span>}
          {category === 'niche' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">Niche</span>}
          {category === 'f2p' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 uppercase">F2P Friendly</span>}
          {category === 'general' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">Valid</span>}
        </div>
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-muted-foreground">
          Score: <span className="text-primary text-sm">{score.total}</span>
        </div>
      </div>

      {/* Characters List (Compact) */}
      <div className="flex gap-2">
        {characters.map(char => {
          const initials = char.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          const bgGradient = elementColors[char.element] || 'from-gray-500 to-gray-700'
          
          return (
            <div key={char.id} className="flex-1 flex flex-col items-center gap-1" title={char.name}>
              {/* Avatar Square */}
              <div className={cn("w-full aspect-square rounded-lg bg-gradient-to-br flex items-center justify-center relative shadow-inner", bgGradient)}>
                <span className="text-sm font-black text-white/90 drop-shadow-md">{initials}</span>
                
                {/* Role Icon Badge */}
                <div className="absolute -bottom-1 -right-1 bg-black/60 backdrop-blur-sm rounded-full p-0.5 text-white/90 border border-white/10 shadow-sm">
                  {roleIcons[char.role]}
                </div>
              </div>
              
              {/* Name */}
              <span className="text-[10px] font-medium text-center truncate w-full text-muted-foreground">
                {char.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Reasons & Score Breakdown */}
      <div className="flex flex-wrap gap-1 mt-1">
        {reasonSummary.map((reason, idx) => (
          <span key={idx} className="px-1.5 py-0.5 text-[9px] rounded bg-white/5 text-muted-foreground border border-white/5">
            {reason}
          </span>
        ))}
      </div>
      
    </div>
  )
}
