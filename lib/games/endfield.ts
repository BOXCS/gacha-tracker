import type { GameConfig } from './index'

export const endfield: GameConfig = {
  id: 'endfield',
  name: 'Arknights: Endfield',
  resinLabel: 'Sanity',
  regenRateSeconds: 360,
  defaultMaxResin: 360,
  isMaxEditable: false,
  secondaryResource: null,
  serverResets: [
    { timezone: 'Asia/Shanghai', hour: 4 },
  ],
}
