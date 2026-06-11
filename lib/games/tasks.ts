import type { GameType } from './index'

export interface GameTaskDef {
  key: string
  label: string
}

export const GAME_TASKS: Record<GameType, GameTaskDef[]> = {
  genshin: [
    { key: 'commission', label: 'Daily Commission' },
    { key: 'expedition', label: 'Expedition' },
    { key: 'teapot', label: 'Serenitea Pot' },
  ],
  hsr: [
    { key: 'training', label: 'Daily Training' },
    { key: 'assignment', label: 'Assignment' },
  ],
  zzz: [
    { key: 'errand', label: 'Daily Errands' },
    { key: 'vr', label: 'VR Battery' },
  ],
  wuwa: [
    { key: 'dailies', label: 'Daily Quests' },
  ],
  nte: [
    { key: 'dailies', label: 'Daily Tasks' },
  ],
  endfield: [
    { key: 'dailies', label: 'Daily Check-in' },
  ],
}

export const GAME_WEEKLY_TASKS: Record<GameType, GameTaskDef[]> = {
  genshin: [
    { key: 'boss', label: 'Weekly Boss ×3' },
    { key: 'abyss', label: 'Spiral Abyss / IT' },
  ],
  hsr: [
    { key: 'echo', label: 'Echo of War ×3' },
    { key: 'su', label: 'Simulated Universe' },
    { key: 'moc', label: 'MoC / PF / AS' },
  ],
  zzz: [
    { key: 'shiyu', label: 'Shiyu Defense' },
    { key: 'boss', label: 'Deadly Assault' },
    { key: 'hollow', label: 'Hollow Zero' },
  ],
  wuwa: [
    { key: 'boss', label: 'Weekly Boss ×3' },
    { key: 'tower', label: 'Tower of Adversity' },
  ],
  nte: [
    { key: 'weekly', label: 'Weekly Mission' },
    { key: 'boss', label: 'Weekly Boss' },
  ],
  endfield: [
    { key: 'weekly', label: 'Weekly Mission' },
    { key: 'annihilation', label: 'Annihilation' },
  ],
}
