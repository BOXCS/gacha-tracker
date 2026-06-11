import { describe, it, expect } from 'vitest'
import { isValidTeam, scoreTeam } from './rules'
import { categorizeTeam } from './categorizer'
import { generateTeamCombinations } from './combinator'
import { ALL_CHARACTERS, getCharacterById } from '../../data/characters/index'
import type { Character } from './types'

describe('Rules Engine (Unit 3)', () => {
  // Helper untuk mengambil list character dari array mock
  const getTeam = (ids: string[]): Character[] => {
    return ids.map(id => getCharacterById(id)!).filter(Boolean)
  }

  it('isValidTeam: menolak tim tanpa damage dealer', () => {
    const team = getTeam(['genshin_zhongli', 'genshin_bennett', 'genshin_kazuha', 'genshin_furina'])
    // Furina = sub_dps, jadi ini valid! Mari kita ubah agar tidak valid.
    // Jika Furina adalah sub_dps, maka ada damage dealer.
    const teamNoDps = [
      { id: '1', role: 'healer' } as Character,
      { id: '2', role: 'healer' } as Character,
      { id: '3', role: 'shielder' } as Character,
      { id: '4', role: 'support' } as Character
    ]
    expect(isValidTeam(teamNoDps, 'spiral_abyss')).toBe(false)
  })

  it('isValidTeam: menyetujui tim dengan damage dealer (Hu Tao + Furina)', () => {
    const team = getTeam(['genshin_hu_tao', 'genshin_xingqiu', 'genshin_zhongli', 'genshin_yelan'])
    expect(isValidTeam(team, 'spiral_abyss')).toBe(true)
  })

  it('scoreTeam: menghitung skor dengan benar untuk tim Meta (Vaporize)', () => {
    const team = getTeam(['genshin_hu_tao', 'genshin_xingqiu', 'genshin_zhongli', 'genshin_yelan'])
    const ownedIds = new Set(team.map(c => c.id))
    
    const score = scoreTeam(team, 'spiral_abyss', ownedIds)
    
    // Coverage: DPS (20) + Sub (15) + Shielder (20) = 55
    expect(score.coverageScore).toBe(55)
    
    // Synergy: Hu Tao -> Xingqiu, Yelan, Zhongli (+30). Xingqiu -> Hu Tao (+10). Yelan -> Hu Tao, Xingqiu (+20). dll.
    expect(score.synergyScore).toBeGreaterThanOrEqual(40)
    
    // Element: Pyro + Hydro = 15
    expect(score.elementScore).toBeGreaterThanOrEqual(15)

    // F2P: Xingqiu (4*) = 10
    expect(score.f2pScore).toBe(10)
  })

  it('categorizeTeam: mengklasifikasikan tim dengan benar', () => {
    const team = getTeam(['genshin_hu_tao', 'genshin_xingqiu', 'genshin_zhongli', 'genshin_yelan'])
    const ownedIds = new Set(team.map(c => c.id))
    const score = scoreTeam(team, 'spiral_abyss', ownedIds)
    
    // Harus masuk Meta karena coverageScore >= 35 dan synergyScore >= 20
    const category = categorizeTeam(team, score)
    expect(category).toBe('meta')
  })

  it('categorizeTeam: mendeteksi tim F2P', () => {
    const team = getTeam(['genshin_xiangling', 'genshin_bennett', 'genshin_xingqiu', 'genshin_raiden'])
    const ownedIds = new Set(team.map(c => c.id))
    const score = scoreTeam(team, 'spiral_abyss', ownedIds)
    
    // Xiangling (F2P), Bennett (4*), Xingqiu (4*) -> 3 karakter F2P/4* -> f2p category
    const category = categorizeTeam(team, score)
    expect(category).toBe('f2p')
  })

  it('generateTeamCombinations: dapat menghasilkan daftar tim tanpa duplikat', () => {
    // 5 karakter: Hu Tao, Xingqiu, Zhongli, Yelan, Bennett
    // C(5, 4) = 5 kombinasi
    const roster = getTeam(['genshin_hu_tao', 'genshin_xingqiu', 'genshin_zhongli', 'genshin_yelan', 'genshin_bennett'])
    
    const combinations = generateTeamCombinations(roster, 'spiral_abyss', 4)
    // Semua kombinasi di atas valid karena semuanya punya setidaknya 1 DPS/SubDPS
    expect(combinations.length).toBe(5)
    
    // Pastikan sorting berdasarkan total skor bekerja (tim pertama harusnya Vaporize optimal)
    expect(combinations[0].score.total).toBeGreaterThanOrEqual(combinations[1].score.total)
  })
})
