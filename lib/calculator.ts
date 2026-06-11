/**
 * Hitung berapa run yang bisa dilakukan dengan resin yang ada
 */
export function computeAffordableRuns(currentResin: number, costPerRun: number): number {
  if (costPerRun <= 0) return 0
  return Math.floor(currentResin / costPerRun)
}

/**
 * Hitung berapa resin yang dibutuhkan untuk N run
 */
export function computeResinNeeded(runs: number, costPerRun: number): number {
  if (runs <= 0 || costPerRun <= 0) return 0
  return runs * costPerRun
}

/**
 * Hitung berapa lama menunggu hingga cukup resin untuk N run
 * Mengembalikan hasil dalam jumlah detik.
 */
export function computeWaitTime(
  currentResin: number,
  targetResin: number,
  regenRateSeconds: number
): number {
  if (currentResin >= targetResin) return 0
  const deficit = targetResin - currentResin
  return deficit * regenRateSeconds
}

/**
 * Hitung berapa refresh/fragile resin yang dibutuhkan untuk menutupi deficit
 * (Setiap refresh/fragile memberikan sejumlah resin, misal 60)
 */
export function computeRefreshesNeeded(deficit: number, resinPerRefresh: number): number {
  if (deficit <= 0 || resinPerRefresh <= 0) return 0
  return Math.ceil(deficit / resinPerRefresh)
}
