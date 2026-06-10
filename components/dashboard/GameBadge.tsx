'use client'

import { cn } from '@/lib/utils'
import type { GameType } from '@/lib/games'

interface GameBadgeProps {
  game: GameType
  className?: string
}

const GAME_BADGE_CONFIG: Record<GameType, { label: string; className: string }> = {
  genshin: {
    label: 'Genshin Impact',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  hsr: {
    label: 'Star Rail',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  zzz: {
    label: 'Zenless Zone Zero',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  },
  wuwa: {
    label: 'Wuthering Waves',
    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  },
  nte: {
    label: 'Neverness to Everness',
    className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  },
  endfield: {
    label: 'Arknights Endfield',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },
}

export function GameBadge({ game, className }: GameBadgeProps) {
  const config = GAME_BADGE_CONFIG[game]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
