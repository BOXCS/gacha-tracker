import type { GameConfig } from './index'

export const wuwa: GameConfig = {
  id: 'wuwa',
  name: 'Wuthering Waves',
  resinLabel: 'Waveplates',
  regenRateSeconds: 360, // +1 per 6 mins
  defaultMaxResin: 240,
  isMaxEditable: false,
  secondaryResource: null,
  serverResets: [
    { timezone: 'Asia/Shanghai', hour: 4 },
  ],
}
