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
