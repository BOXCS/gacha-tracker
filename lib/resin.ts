/**
 * lib/resin.ts
 *
 * Core resin calculation logic — PURE, DETERMINISTIC, FULLY TESTED.
 * INVARIANT: Kalkulasi resin TIDAK PERNAH dilakukan di server saat runtime —
 * selalu client-side menggunakan current_resin + last_updated_at + regen_rate.
 *
 * Semua fungsi menerima parameter `now` opsional untuk memudahkan testing
 * deterministik tanpa mocking Date.
 */

/**
 * Menghitung nilai resin saat ini berdasarkan nilai terakhir yang disimpan,
 * timestamp pembaruan, dan rate regenerasi game.
 *
 * @param currentResin  Nilai resin yang tersimpan di DB
 * @param maxResin      Nilai resin maksimum
 * @param lastUpdatedAt ISO 8601 string — kapan currentResin terakhir disimpan
 * @param regenRateSeconds Detik per +1 resin
 * @param now           Waktu saat ini (default: new Date())
 * @returns Nilai resin yang sudah diperhitungkan, tidak melebihi maxResin
 */
export function computeResin(
  currentResin: number,
  maxResin: number,
  lastUpdatedAt: string,
  regenRateSeconds: number,
  now: Date = new Date()
): number {
  const elapsedSeconds = (now.getTime() - new Date(lastUpdatedAt).getTime()) / 1000
  const gained = Math.floor(elapsedSeconds / regenRateSeconds)
  return Math.min(currentResin + gained, maxResin)
}

/**
 * Menghitung detik yang tersisa hingga resin penuh.
 * Memperhitungkan resin yang sudah regen + sisa waktu dalam siklus regen saat ini.
 *
 * @returns 0 jika sudah penuh, jumlah detik jika belum penuh
 */
export function computeSecondsToFull(
  currentResin: number,
  maxResin: number,
  lastUpdatedAt: string,
  regenRateSeconds: number,
  now: Date = new Date()
): number {
  const computed = computeResin(currentResin, maxResin, lastUpdatedAt, regenRateSeconds, now)
  if (computed >= maxResin) return 0

  const remaining = maxResin - computed
  const elapsedSeconds = (now.getTime() - new Date(lastUpdatedAt).getTime()) / 1000
  const elapsedFraction = elapsedSeconds % regenRateSeconds

  return remaining * regenRateSeconds - elapsedFraction
}

/**
 * Menghitung persentase pengisian resin (0–100).
 */
export function computeResinPercent(
  currentResin: number,
  maxResin: number,
  lastUpdatedAt: string,
  regenRateSeconds: number,
  now: Date = new Date()
): number {
  const computed = computeResin(currentResin, maxResin, lastUpdatedAt, regenRateSeconds, now)
  return (computed / maxResin) * 100
}

/**
 * Menentukan status visual resin berdasarkan persentase.
 * - 'full'    : 100%       → merah  (--resin-critical)
 * - 'warning' : ≥ 80%     → amber  (--resin-warning)
 * - 'normal'  : < 80%     → ungu   (--resin-fill)
 */
export type ResinStatus = 'normal' | 'warning' | 'full'

export function getResinStatus(percent: number): ResinStatus {
  if (percent >= 100) return 'full'
  if (percent >= 80) return 'warning'
  return 'normal'
}

/**
 * Format detik menjadi string "HH:MM:SS" untuk CountdownTimer.
 */
export function formatSecondsToHMS(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, '0'))
    .join(':')
}
