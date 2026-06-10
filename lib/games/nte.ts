import type { GameConfig } from './index'

export const nte: GameConfig = {
  id: 'nte',
  name: 'Neverness to Everness',
  resinLabel: 'City Stamina',
  regenRateSeconds: 360,
  defaultMaxResin: 240,
  isMaxEditable: true,
  secondaryResource: {
    label: 'Character Pixel',
    regenRateSeconds: 360, 
    defaultMax: 240,
    isMaxEditable: true,
  },
  serverResets: [
    { timezone: 'Asia/Shanghai', hour: 4 },
  ],
}
