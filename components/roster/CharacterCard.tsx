'use client'

import React from 'react'
import type { Character } from '@/lib/teambuilder/types'
import { Swords, Zap, Wand2, HeartPulse, Shield, Star, Plus, Minus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CharacterCardProps {
  character: Character
  owned: boolean
  constellation: number
  onToggleOwned: () => void
  onChangeConstellation: (val: number) => void
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

export function CharacterCard({
  character,
  owned,
  constellation,
  onToggleOwned,
  onChangeConstellation
}: CharacterCardProps) {
  
  // Ambil inisial nama (maksimal 2 huruf pertama dari tiap kata)
  const initials = character.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  
  const bgGradient = elementColors[character.element] || 'from-gray-500 to-gray-700'
  
  return (
    <div 
      className={cn(
        "relative rounded-xl overflow-hidden border border-white/10 transition-all duration-300 cursor-pointer group hover:scale-[1.02]",
        owned ? "opacity-100" : "opacity-50 grayscale hover:grayscale-0",
        owned ? "shadow-lg shadow-white/5" : ""
      )}
      onClick={onToggleOwned}
    >
      {/* Background Avatar Section */}
      <div className={cn("h-24 w-full bg-gradient-to-br flex items-center justify-center relative", bgGradient)}>
        <span className="text-3xl font-black text-white/90 drop-shadow-md tracking-tighter">
          {initials}
        </span>
        
        {/* Role Icon */}
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full p-1.5 text-white/90">
          {roleIcons[character.role]}
        </div>

        {/* Owned Checkmark Overlay */}
        {owned && (
          <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1 shadow-md shadow-black/50">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-card/90 backdrop-blur-md p-3">
        <h3 className="font-bold text-sm truncate" title={character.name}>
          {character.name}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex text-yellow-400">
            {Array.from({ length: character.rarity }).map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 fill-current" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {character.element}
          </span>
        </div>

        {/* Constellation Control (Hanya tampil jika dimiliki) */}
        {owned && (
          <div 
            className="mt-3 flex items-center justify-between bg-black/20 rounded-md p-1"
            onClick={(e) => e.stopPropagation()} // Prevent toggling ownership when clicking controls
          >
            <button 
              onClick={() => onChangeConstellation(Math.max(0, constellation - 1))}
              className="p-1 rounded bg-white/5 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
              disabled={constellation === 0}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono font-bold">
              C{constellation}
            </span>
            <button 
              onClick={() => onChangeConstellation(Math.min(6, constellation + 1))}
              className="p-1 rounded bg-white/5 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
              disabled={constellation === 6}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
