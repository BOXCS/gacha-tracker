import type { GameConfig } from './index'

export const hsr: GameConfig = {
  id: 'hsr',
  name: 'Honkai: Star Rail',
  resinLabel: 'Trailblaze Power',
  regenRateSeconds: 360, // +1 per 6 menit
  defaultMaxResin: 180,
  isMaxEditable: false,
  // NOTE: Max TP 240 saat event dihandle sebagai max_resin editable per akun di game_accounts,
  // bukan di config ini. Config ini hanya menyimpan default.
  secondaryResource: null,
  serverResets: [
    { timezone: 'Asia/Shanghai', hour: 4 }, // Default server
  ],
}
