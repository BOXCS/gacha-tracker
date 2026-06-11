import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { getCurrentGameDate, getWeeklyResetDate } from './reset'

describe('getCurrentGameDate', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('returns the same date when time is exactly at or after reset hour (04:00)', () => {
    // 04:00 AM UTC+8 is 20:00 PM UTC previous day
    // Let's set local machine time to UTC for the test execution to be deterministic
    const date1 = new Date(Date.UTC(2026, 5, 9, 20, 0, 0)) // 2026-06-09T20:00:00Z -> 2026-06-10T04:00:00 UTC+8
    expect(getCurrentGameDate('genshin', date1)).toBe('2026-06-10')

    const date2 = new Date(Date.UTC(2026, 5, 9, 23, 59, 59)) // 2026-06-10T07:59:59 UTC+8
    expect(getCurrentGameDate('genshin', date2)).toBe('2026-06-10')
  })

  it('returns the previous date when time is before reset hour (03:59)', () => {
    // 03:59 AM UTC+8 is 19:59 PM UTC previous day
    const date1 = new Date(Date.UTC(2026, 5, 9, 19, 59, 59)) // 2026-06-10T03:59:59 UTC+8
    expect(getCurrentGameDate('genshin', date1)).toBe('2026-06-09')

    // 00:00 AM UTC+8 is 16:00 PM UTC previous day
    const date2 = new Date(Date.UTC(2026, 5, 9, 16, 0, 0)) // 2026-06-10T00:00:00 UTC+8
    expect(getCurrentGameDate('genshin', date2)).toBe('2026-06-09')
  })

  it('handles month boundaries correctly', () => {
    // July 1st 03:00 AM UTC+8 -> should be June 30th
    const date1 = new Date(Date.UTC(2026, 5, 30, 19, 0, 0)) // 2026-07-01T03:00:00 UTC+8
    expect(getCurrentGameDate('genshin', date1)).toBe('2026-06-30')

    // March 1st 03:00 AM UTC+8 (non-leap year) -> should be Feb 28th
    const date2 = new Date(Date.UTC(2026, 1, 28, 19, 0, 0)) // 2026-03-01T03:00:00 UTC+8
    expect(getCurrentGameDate('genshin', date2)).toBe('2026-02-28')

    // March 1st 03:00 AM UTC+8 (leap year) -> should be Feb 29th
    const date3 = new Date(Date.UTC(2024, 1, 29, 19, 0, 0)) // 2024-03-01T03:00:00 UTC+8
    expect(getCurrentGameDate('genshin', date3)).toBe('2024-02-29')
  })

  it('handles year boundaries correctly', () => {
    // Jan 1st 03:00 AM UTC+8 -> should be Dec 31st of previous year
    const date1 = new Date(Date.UTC(2025, 11, 31, 19, 0, 0)) // 2026-01-01T03:00:00 UTC+8
    expect(getCurrentGameDate('genshin', date1)).toBe('2025-12-31')
  })
})

describe('getWeeklyResetDate', () => {
  it('returns the Monday date when it is exactly Monday reset time', () => {
    // 2023-10-09 is a Monday. 04:00 AM UTC+8 is Sunday 20:00:00Z
    const d = new Date('2023-10-08T20:00:00Z')
    expect(getWeeklyResetDate('genshin', d)).toBe('2023-10-09')
  })

  it('returns the Monday date when it is Wednesday', () => {
    // 2023-10-11 is a Wednesday
    const d = new Date('2023-10-11T04:00:00Z')
    expect(getWeeklyResetDate('genshin', d)).toBe('2023-10-09')
  })

  it('returns the previous Monday date when it is Monday BEFORE reset time', () => {
    // 2023-10-09 is Monday. 03:00 AM UTC+8 -> belongs to Sunday Oct 8, which belongs to previous Monday Oct 2
    const d = new Date('2023-10-08T19:00:00Z')
    expect(getWeeklyResetDate('genshin', d)).toBe('2023-10-02')
  })

  it('returns the previous Monday date when it is Sunday AFTER reset time', () => {
    // 2023-10-08 is Sunday. 12:00 PM UTC+8. Game date is Oct 8. Monday is Oct 2.
    const d = new Date('2023-10-08T04:00:00Z')
    expect(getWeeklyResetDate('genshin', d)).toBe('2023-10-02')
  })
})
