export type GameType = 'genshin' | 'hsr' | 'zzz' | 'wuwa' | 'nte' | 'endfield'

export interface SecondaryResourceConfig {
  label: string
  regenRateSeconds: number
  defaultMax: number
  isMaxEditable: boolean
}

export interface ServerReset {
  timezone: string
  hour: number
}

export interface GameConfig {
  id: GameType
  name: string
  resinLabel: string
  regenRateSeconds: number
  defaultMaxResin: number
  isMaxEditable: boolean
  secondaryResource: SecondaryResourceConfig | null
  serverResets: ServerReset[]
}

// ─── Game Registry ──────────────────────────────────────────────────────────
// Import order must match GameType union.
// To add a new game: add its GameType to the union above,
// create lib/games/<game>.ts, and add its export here.
// DO NOT change the GameConfig interface.

export { genshin } from './genshin'
export { hsr } from './hsr'
export { zzz } from './zzz'
export { wuwa } from './wuwa'
export { nte } from './nte'
export { endfield } from './endfield'

import { genshin } from './genshin'
import { hsr } from './hsr'
import { zzz } from './zzz'
import { wuwa } from './wuwa'
import { nte } from './nte'
import { endfield } from './endfield'

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  genshin,
  hsr,
  zzz,
  wuwa,
  nte,
  endfield,
}

export function getGameConfig(gameType: GameType): GameConfig {
  const config = GAME_CONFIGS[gameType]
  if (!config) throw new Error(`Game config not found for: ${gameType}`)
  return config
}
