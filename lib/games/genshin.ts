import type { GameConfig } from './index'

export const genshin: GameConfig = {
  id: 'genshin',
  name: 'Genshin Impact',
  resinLabel: 'Resin',
  regenRateSeconds: 480, // +1 per 8 menit
  defaultMaxResin: 160,
  isMaxEditable: false,
  secondaryResource: null,
  serverResets: [
    { timezone: 'Asia/Shanghai', hour: 4 }, // Default server
  ],
}
