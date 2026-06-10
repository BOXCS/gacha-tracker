import type { GameConfig } from './index'

export const zzz: GameConfig = {
  id: 'zzz',
  name: 'Zenless Zone Zero',
  resinLabel: 'Battery Charge',
  regenRateSeconds: 360, // +1 per 6 menit
  defaultMaxResin: 240,
  isMaxEditable: false,
  secondaryResource: null,
  serverResets: [
    { timezone: 'Asia/Shanghai', hour: 6 }, // Default server
  ],
}
