import { describe, it, expect } from 'vitest'
import {
  computeAffordableRuns,
  computeResinNeeded,
  computeWaitTime,
  computeRefreshesNeeded
} from './calculator'

describe('Calculator Logic', () => {
  describe('computeAffordableRuns', () => {
    it('calculates affordable runs correctly', () => {
      expect(computeAffordableRuns(150, 40)).toBe(3) // 3 runs, 30 resin leftover
      expect(computeAffordableRuns(160, 40)).toBe(4)
      expect(computeAffordableRuns(20, 40)).toBe(0)
    })

    it('handles zero or negative cost safely', () => {
      expect(computeAffordableRuns(100, 0)).toBe(0)
      expect(computeAffordableRuns(100, -10)).toBe(0)
    })
  })

  describe('computeResinNeeded', () => {
    it('calculates resin needed correctly', () => {
      expect(computeResinNeeded(5, 40)).toBe(200)
      expect(computeResinNeeded(1, 20)).toBe(20)
    })

    it('handles zero or negative inputs', () => {
      expect(computeResinNeeded(0, 40)).toBe(0)
      expect(computeResinNeeded(5, 0)).toBe(0)
    })
  })

  describe('computeWaitTime', () => {
    it('calculates wait time in seconds correctly', () => {
      // 10 resin needed, 8 minutes (480s) per resin = 4800 seconds
      expect(computeWaitTime(10, 20, 480)).toBe(4800)
    })

    it('returns 0 if current resin is already >= target resin', () => {
      expect(computeWaitTime(40, 20, 480)).toBe(0)
      expect(computeWaitTime(20, 20, 480)).toBe(0)
    })
  })

  describe('computeRefreshesNeeded', () => {
    it('calculates number of fragile resin/refreshes needed', () => {
      expect(computeRefreshesNeeded(10, 60)).toBe(1)
      expect(computeRefreshesNeeded(60, 60)).toBe(1)
      expect(computeRefreshesNeeded(61, 60)).toBe(2)
      expect(computeRefreshesNeeded(120, 60)).toBe(2)
    })

    it('returns 0 if deficit <= 0', () => {
      expect(computeRefreshesNeeded(0, 60)).toBe(0)
      expect(computeRefreshesNeeded(-10, 60)).toBe(0)
    })

    it('handles invalid refresh amounts safely', () => {
      expect(computeRefreshesNeeded(100, 0)).toBe(0)
    })
  })
})
