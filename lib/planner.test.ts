import { describe, it, expect } from 'vitest'
import { getTodayDomains } from './planner'

describe('Farming Planner Logic', () => {
  it('returns Monday domains exactly at reset time on Monday', () => {
    // 2026-06-08 is Monday. 04:00 AM UTC+8 is Sunday 20:00:00 UTC
    const date = new Date(Date.UTC(2026, 5, 7, 20, 0, 0)) // 2026-06-08T04:00:00 UTC+8
    const domains = getTodayDomains('genshin', date)
    
    expect(domains.length).toBeGreaterThan(0)
    expect(domains[0].id).toBe('g_t_mon')
  })

  it('returns Sunday domains just before reset time on Monday', () => {
    // 2026-06-08 is Monday. 03:59 AM UTC+8 is Sunday 19:59:00 UTC
    const date = new Date(Date.UTC(2026, 5, 7, 19, 59, 0)) // 2026-06-08T03:59:00 UTC+8
    const domains = getTodayDomains('genshin', date)
    
    // Should return Sunday domains
    expect(domains[0].id).toBe('g_all')
  })

  it('returns Tuesday domains on Tuesday afternoon', () => {
    // 2026-06-09 is Tuesday. 15:00 PM UTC+8 is Tuesday 07:00:00 UTC
    const date = new Date(Date.UTC(2026, 5, 9, 7, 0, 0)) // 2026-06-09T15:00:00 UTC+8
    const domains = getTodayDomains('genshin', date)
    
    expect(domains[0].id).toBe('g_t_tue')
  })

  it('returns "always available" for non-rotating games', () => {
    const date = new Date(Date.UTC(2026, 5, 9, 7, 0, 0)) 
    const hsrDomains = getTodayDomains('hsr', date)
    expect(hsrDomains[0].id).toBe('hsr_all')
    
    const wuwaDomains = getTodayDomains('wuwa', date)
    expect(wuwaDomains[0].id).toBe('wuwa_all')
  })
})
