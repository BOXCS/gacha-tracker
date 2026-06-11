import React from 'react'
import type { ScoredTeam } from '@/lib/teambuilder/types'
import { cn } from '@/lib/utils'
import { Swords, Zap, Wand2, HeartPulse, Shield } from 'lucide-react'

interface TeamCardProps {
  teamData: ScoredTeam
  index?: number
}

const elementColors: Record<string, { from: string; to: string; glow: string; text: string }> = {
  Pyro:     { from: 'from-orange-500', to: 'to-red-600',    glow: 'shadow-orange-500/30', text: 'text-orange-300' },
  Hydro:    { from: 'from-blue-400',   to: 'to-blue-600',   glow: 'shadow-blue-500/30',   text: 'text-blue-300' },
  Anemo:    { from: 'from-teal-400',   to: 'to-emerald-500',glow: 'shadow-teal-500/30',   text: 'text-teal-300' },
  Electro:  { from: 'from-purple-400', to: 'to-violet-600', glow: 'shadow-purple-500/30', text: 'text-purple-300' },
  Dendro:   { from: 'from-green-400',  to: 'to-green-600',  glow: 'shadow-green-500/30',  text: 'text-green-300' },
  Cryo:     { from: 'from-cyan-300',   to: 'to-cyan-500',   glow: 'shadow-cyan-500/30',   text: 'text-cyan-300' },
  Geo:      { from: 'from-amber-400',  to: 'to-yellow-600', glow: 'shadow-amber-500/30',  text: 'text-amber-300' },
  Physical: { from: 'from-slate-400',  to: 'to-slate-600',  glow: 'shadow-slate-500/30',  text: 'text-slate-300' },
}

const categoryConfig = {
  meta:    { label: 'Meta',        bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  niche:   { label: 'Niche',       bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  f2p:     { label: 'F2P',         bg: 'bg-emerald-500/15',border: 'border-emerald-500/30',text: 'text-emerald-400',dot: 'bg-emerald-400' },
  general: { label: 'Valid',       bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-blue-400',   dot: 'bg-blue-400' },
}

const roleIcons = {
  dps:     { icon: <Swords className="w-2.5 h-2.5" />,    label: 'DPS' },
  sub_dps: { icon: <Zap className="w-2.5 h-2.5" />,       label: 'Sub' },
  support: { icon: <Wand2 className="w-2.5 h-2.5" />,     label: 'Sup' },
  healer:  { icon: <HeartPulse className="w-2.5 h-2.5" />,label: 'Heal' },
  shielder:{ icon: <Shield className="w-2.5 h-2.5" />,    label: 'Shld' },
}

export function TeamCard({ teamData, index = 0 }: TeamCardProps) {
  const { characters, score, category, reasonSummary } = teamData
  const cat = categoryConfig[category]

  // CSS-driven stagger: hanya 6 kartu pertama yang animate, sisanya muncul instan
  // Ini jauh lebih ringan daripada JS-driven Framer Motion per kartu
  const animDelay = index < 6 ? `${index * 60}ms` : '0ms'

  return (
    <div
      className="team-card-enter flex flex-col gap-3 p-3.5 rounded-2xl border border-white/8 bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/15 hover:-translate-y-0.5 transition-[colors,transform] duration-200 cursor-default overflow-hidden relative"
      style={{ animationDelay: animDelay }}
    >
      {/* Top gradient accent */}
      <div className={cn("absolute top-0 left-0 right-0 h-[1px]", cat.dot === 'bg-amber-400' && "bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent", cat.dot === 'bg-purple-400' && "bg-gradient-to-r from-purple-500/60 via-purple-400/30 to-transparent", cat.dot === 'bg-emerald-400' && "bg-gradient-to-r from-emerald-500/60 via-emerald-400/30 to-transparent", cat.dot === 'bg-blue-400' && "bg-gradient-to-r from-blue-500/60 via-blue-400/30 to-transparent")} />

      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border", cat.bg, cat.border, cat.text)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cat.dot)} />
          {cat.label}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/50">
          {score.total}<span className="text-muted-foreground/30">pts</span>
        </span>
      </div>

      {/* Character avatars */}
      <div className="flex gap-2">
        {characters.map((char) => {
          const initials = char.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          const elColor = elementColors[char.element] || elementColors.Physical
          const role = roleIcons[char.role]

          return (
            <div key={char.id} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Avatar */}
              <div className={cn(
                "w-full aspect-square rounded-xl bg-gradient-to-br relative overflow-hidden",
                `shadow-lg ${elColor.glow}`,
                elColor.from, elColor.to
              )}>
                {/* Inner highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {char.imageUrl ? (
                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover object-top opacity-90" />
                  ) : (
                    <span className="text-sm font-black text-white/95 drop-shadow">{initials}</span>
                  )}
                </div>
                {/* Role badge — bg saja, tanpa backdrop-blur agar tidak trigger compositing */}
                <div className="absolute bottom-0.5 right-0.5 bg-black/60 rounded-md px-1 py-0.5 flex items-center gap-0.5 text-white/90 z-20">
                  {role.icon}
                </div>
              </div>

              {/* Name */}
              <span className={cn("text-[9px] font-semibold text-center truncate w-full leading-none", elColor.text)}>
                {char.name.split(' ')[0]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Score mini-bars */}
      <div className="grid grid-cols-2 gap-1">
        {[
          { label: 'Syn', val: score.synergyScore, max: 40 },
          { label: 'Cov', val: score.coverageScore, max: 30 },
          { label: 'Ele', val: score.elementScore, max: 30 },
          { label: 'Con', val: score.contentScore, max: 20 },
        ].map(({ label, val, max }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono text-muted-foreground/40 w-5 shrink-0">{label}</span>
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/30 rounded-full"
                style={{ width: `${Math.min(100, (val / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reason chips */}
      {reasonSummary.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reasonSummary.slice(0, 3).map((reason, idx) => (
            <span key={idx} className="px-1.5 py-0.5 text-[9px] rounded-md bg-white/[0.04] text-muted-foreground/50 border border-white/[0.06]">
              {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
