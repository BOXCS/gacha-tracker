import type { TeamScore, TeamCategory, Character } from './types'

/**
 * Mengkategorikan tim berdasarkan profil skor mereka.
 * 
 * - Meta: Mengandalkan banyak sinergi, karakter premium, dan role coverage tinggi.
 * - F2P: Mayoritas karakter F2P/Bintang 4 namun tetap kompeten.
 * - Niche: Tim yang lebih mengandalkan reaksi spesifik atau non-mainstream (score total mungkin lebih rendah tapi unik).
 */
export function categorizeTeam(team: Character[], score: TeamScore): TeamCategory {
  // Hitung jumlah karakter F2P atau Bintang 4
  const f2pCount = team.filter(c => c.isFreeOrF2P || c.rarity === 4).length

  if (f2pCount >= 3) {
    return 'f2p'
  }

  // Jika synergy dan element score sangat tinggi, serta kebanyakan bintang 5, asumsikan ini Meta
  if (score.synergyScore >= 20 && score.coverageScore >= 35) {
    return 'meta'
  }

  // Jika skor elemen tinggi tapi sinergi direct (synergies list) rendah, mungkin ini kombo Niche
  if (score.elementScore > 0 && score.synergyScore < 20) {
    return 'niche'
  }

  return 'general'
}

/**
 * Menghasilkan teks ringkasan ("Reason Summary") untuk kartu tim.
 * Misal: ["Vaporize Core", "High F2P Ratio", "Perfect Synergy"]
 */
export function generateReasonSummary(team: Character[], score: TeamScore, category: TeamCategory): string[] {
  const reasons: string[] = []

  if (score.elementScore >= 15) reasons.push('Strong Elemental Reactions')
  else if (score.elementScore > 0) reasons.push('Elemental Reactions')

  if (score.synergyScore >= 20) reasons.push('Perfect Character Synergy')

  if (score.coverageScore >= 50) reasons.push('Excellent Role Coverage')

  if (category === 'f2p') reasons.push('F2P / 4★ Friendly')

  const tags = new Set<string>()
  team.forEach(c => c.tags.forEach(t => tags.add(t)))
  if (tags.has('vaporize') || tags.has('national')) reasons.push('Meta Core')

  // Batasi hanya 3 alasan utama
  return reasons.slice(0, 3)
}
