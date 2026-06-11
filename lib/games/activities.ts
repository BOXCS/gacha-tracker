import type { GameType } from './index'

export interface GameActivity {
  id: string
  label: string
  cost: number
}

export const GAME_ACTIVITIES: Record<GameType, GameActivity[]> = {
  genshin: [
    { id: 'domain', label: 'Domain (Artifact/Talent/Weapon)', cost: 20 },
    { id: 'leyline', label: 'Ley Line Outcrop', cost: 20 },
    { id: 'boss', label: 'Normal Boss', cost: 40 },
    { id: 'weekly_boss_30', label: 'Weekly Boss (First 3)', cost: 30 },
    { id: 'weekly_boss_60', label: 'Weekly Boss (4th+)', cost: 60 },
  ],
  hsr: [
    { id: 'cavern', label: 'Cavern of Corrosion', cost: 40 },
    { id: 'calyx_golden', label: 'Calyx (Golden) per 10', cost: 10 },
    { id: 'calyx_crimson', label: 'Calyx (Crimson) per 10', cost: 10 },
    { id: 'stagnant', label: 'Stagnant Shadow', cost: 30 },
    { id: 'echo', label: 'Echo of War', cost: 30 },
    { id: 'planar', label: 'Simulated Universe (Planar)', cost: 40 },
  ],
  zzz: [
    { id: 'combat', label: 'Combat Simulation per card', cost: 10 },
    { id: 'routine', label: 'Routine Cleanup', cost: 40 },
    { id: 'expert', label: 'Expert Challenge', cost: 40 },
  ],
  wuwa: [
    { id: 'tacet', label: 'Tacet Field', cost: 60 },
    { id: 'boss', label: 'Overworld Boss', cost: 60 },
    { id: 'weekly_boss', label: 'Weekly Boss', cost: 60 },
    { id: 'forgery', label: 'Forgery Challenge', cost: 40 },
    { id: 'simulation', label: 'Simulation Training', cost: 40 },
  ],
  nte: [
    { id: 'commission', label: 'Commission/Domain', cost: 30 },
    { id: 'boss', label: 'Boss', cost: 40 },
  ],
  endfield: [
    { id: 'resource', label: 'Resource Stage', cost: 30 },
  ]
}
