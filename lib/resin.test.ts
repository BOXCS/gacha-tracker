import { describe, it, expect } from 'vitest'
import {
  computeResin,
  computeSecondsToFull,
  computeResinPercent,
  getResinStatus,
  formatSecondsToHMS,
} from './resin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Buat lastUpdatedAt dengan delta detik dari `now` */
function timestampSecondsAgo(now: Date, secondsAgo: number): string {
  return new Date(now.getTime() - secondsAgo * 1000).toISOString()
}

// ─── computeResin ─────────────────────────────────────────────────────────────

describe('computeResin', () => {
  it('mengembalikan nilai awal jika belum ada waktu berlalu', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 0)
    expect(computeResin(100, 160, lastUpdatedAt, 480, now)).toBe(100)
  })

  it('menambah resin sesuai waktu yang berlalu (Genshin: 480s/resin)', () => {
    const now = new Date()
    // 5 siklus × 480 detik = 2400 detik = +5 resin
    const lastUpdatedAt = timestampSecondsAgo(now, 2400)
    expect(computeResin(100, 160, lastUpdatedAt, 480, now)).toBe(105)
  })

  it('tidak melebihi maxResin', () => {
    const now = new Date()
    // Cukup waktu untuk overflow
    const lastUpdatedAt = timestampSecondsAgo(now, 480 * 100)
    expect(computeResin(100, 160, lastUpdatedAt, 480, now)).toBe(160)
  })

  it('mengembalikan nilai tepat saat regen belum genap 1 siklus (floor)', () => {
    const now = new Date()
    // 479 detik = kurang 1 detik untuk regen pertama
    const lastUpdatedAt = timestampSecondsAgo(now, 479)
    expect(computeResin(50, 160, lastUpdatedAt, 480, now)).toBe(50)
  })

  it('menambah +1 tepat setelah 1 siklus genap (Genshin: 480s)', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 480)
    expect(computeResin(50, 160, lastUpdatedAt, 480, now)).toBe(51)
  })

  it('bekerja dengan rate berbeda (HSR: 360s/resin)', () => {
    const now = new Date()
    // 10 siklus × 360 detik = 3600 detik = +10 TP
    const lastUpdatedAt = timestampSecondsAgo(now, 3600)
    expect(computeResin(80, 180, lastUpdatedAt, 360, now)).toBe(90)
  })

  it('mengembalikan maxResin jika currentResin sudah di max', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 1000)
    expect(computeResin(160, 160, lastUpdatedAt, 480, now)).toBe(160)
  })
})

// ─── computeSecondsToFull ─────────────────────────────────────────────────────

describe('computeSecondsToFull', () => {
  it('mengembalikan 0 jika resin sudah penuh', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 0)
    expect(computeSecondsToFull(160, 160, lastUpdatedAt, 480, now)).toBe(0)
  })

  it('mengembalikan 0 jika resin sudah overflow (melewati max)', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 480 * 100)
    expect(computeSecondsToFull(100, 160, lastUpdatedAt, 480, now)).toBe(0)
  })

  it('menghitung sisa waktu dengan benar dari awal siklus', () => {
    const now = new Date()
    // currentResin = 159, perlu 1 resin lagi. Baru mulai siklus (0 detik berlalu dalam siklus ini).
    const lastUpdatedAt = timestampSecondsAgo(now, 0)
    const result = computeSecondsToFull(159, 160, lastUpdatedAt, 480, now)
    // Sisa = 1 × 480 - 0 = 480
    expect(result).toBeCloseTo(480, 0)
  })

  it('memperhitungkan sisa detik dalam siklus regen saat ini', () => {
    const now = new Date()
    // Sudah 240 detik (setengah siklus) berlalu, resin = 100, max = 160
    // computed = 100 + floor(240/480) = 100 + 0 = 100
    // remaining = 60, elapsedFraction = 240
    // result = 60 * 480 - 240 = 28800 - 240 = 28560
    const lastUpdatedAt = timestampSecondsAgo(now, 240)
    const result = computeSecondsToFull(100, 160, lastUpdatedAt, 480, now)
    expect(result).toBeCloseTo(28560, 0)
  })
})

// ─── computeResinPercent ──────────────────────────────────────────────────────

describe('computeResinPercent', () => {
  it('mengembalikan 100 jika resin penuh', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 0)
    expect(computeResinPercent(160, 160, lastUpdatedAt, 480, now)).toBe(100)
  })

  it('mengembalikan 50 jika resin setengah penuh', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 0)
    expect(computeResinPercent(80, 160, lastUpdatedAt, 480, now)).toBe(50)
  })

  it('mengembalikan 0 jika resin kosong', () => {
    const now = new Date()
    const lastUpdatedAt = timestampSecondsAgo(now, 0)
    expect(computeResinPercent(0, 160, lastUpdatedAt, 480, now)).toBe(0)
  })
})

// ─── getResinStatus ───────────────────────────────────────────────────────────

describe('getResinStatus', () => {
  it('mengembalikan "normal" di bawah 80%', () => {
    expect(getResinStatus(0)).toBe('normal')
    expect(getResinStatus(50)).toBe('normal')
    expect(getResinStatus(79.9)).toBe('normal')
  })

  it('mengembalikan "warning" pada 80% dan di atasnya (sebelum 100%)', () => {
    expect(getResinStatus(80)).toBe('warning')
    expect(getResinStatus(95)).toBe('warning')
    expect(getResinStatus(99.9)).toBe('warning')
  })

  it('mengembalikan "full" tepat di 100%', () => {
    expect(getResinStatus(100)).toBe('full')
    expect(getResinStatus(101)).toBe('full')
  })
})

// ─── formatSecondsToHMS ───────────────────────────────────────────────────────

describe('formatSecondsToHMS', () => {
  it('memformat 0 detik menjadi 00:00:00', () => {
    expect(formatSecondsToHMS(0)).toBe('00:00:00')
  })

  it('memformat 3661 detik menjadi 01:01:01', () => {
    expect(formatSecondsToHMS(3661)).toBe('01:01:01')
  })

  it('memformat 3600 detik menjadi 01:00:00', () => {
    expect(formatSecondsToHMS(3600)).toBe('01:00:00')
  })

  it('memformat 86399 detik menjadi 23:59:59', () => {
    expect(formatSecondsToHMS(86399)).toBe('23:59:59')
  })

  it('tidak mengembalikan nilai negatif (clamp ke 0)', () => {
    expect(formatSecondsToHMS(-100)).toBe('00:00:00')
  })

  it('memformat detik desimal dengan floor', () => {
    expect(formatSecondsToHMS(90.9)).toBe('00:01:30')
  })
})
