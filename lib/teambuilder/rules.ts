import type { OwnedCharacter, ContentType, TeamScore } from './types'

// Konstanta batas ukuran tim per game (saat ini di-hardcode)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getRequiredTeamSize(_gameType: string): number {
  return 4 // Genshin, HSR, ZZZ, Wuwa mayoritas menggunakan tim berisi 4 atau 3. Untuk MVP, asumsikan Genshin (4).
}

/**
 * Validasi apakah kombinasi karakter membentuk tim yang valid
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isValidTeam(team: OwnedCharacter[], _contentType: ContentType): boolean {
  if (team.length === 0) return false

  // Minimal ada 1 DPS atau Sub DPS untuk memastikan tim punya damage dealer
  const hasDamageDealer = team.some(c => c.role === 'dps' || c.role === 'sub_dps')
  if (!hasDamageDealer) return false

  // Pastikan tidak ada karakter duplikat di dalam satu tim
  const uniqueIds = new Set(team.map(c => c.id))
  if (uniqueIds.size !== team.length) return false

  return true
}

/**
 * Hitung skor kekuatan dan sinergi dari sebuah tim
 */
export function scoreTeam(
  team: OwnedCharacter[],
  contentType: ContentType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ownedIds: Set<string>
): TeamScore {
  let synergyScore = 0
  let coverageScore = 0
  let elementScore = 0
  let contentScore = 0
  let f2pScore = 0
  let constellationScore = 0

  // 1. Coverage Score: Semakin lengkap kombinasi role, semakin bagus.
  // Idealnya ada Main DPS, Sub DPS, dan utilitas (Support/Healer/Shielder).
  const roles = new Set(team.map(c => c.role))
  if (roles.has('dps')) coverageScore += 20
  if (roles.has('sub_dps')) coverageScore += 15
  if (roles.has('support')) coverageScore += 15
  if (roles.has('healer') || roles.has('shielder')) coverageScore += 20

  // 2. Synergy Score: Cek explicit synergies di metadata karakter
  const teamIds = new Set(team.map(c => c.id))
  team.forEach(c => {
    c.synergies.forEach(synId => {
      if (teamIds.has(synId)) {
        synergyScore += 10 // Poin ekstra jika membawa pasangan sinergisnya
      }
    })
  })

  // 3. Content Score: Cek apakah karakter direkomendasikan untuk konten tersebut
  team.forEach(c => {
    if (c.recommendedFor.includes(contentType) || c.recommendedFor.includes('general')) {
      contentScore += 10
    }
  })

  // 4. Element Score: Bonus untuk reaksi elemen (contoh: Vaporize = Pyro + Hydro)
  const elements = new Set(team.map(c => c.element))
  if (elements.has('Pyro') && elements.has('Hydro')) elementScore += 15
  if (elements.has('Hydro') && elements.has('Cryo')) elementScore += 10 // Freeze
  if (elements.has('Electro') && elements.has('Hydro')) elementScore += 10 // Electro-Charged

  // 5. F2P Score: Bonus untuk karakter yang F2P atau rarity 4
  team.forEach(c => {
    if (c.isFreeOrF2P) f2pScore += 20
    else if (c.rarity === 4) f2pScore += 10
  })

  // 6. Constellation Score: Evaluasi bobot konstelasi
  team.forEach(c => {
    if (c.constellation > 0) {
      if (c.constellationWeights && c.constellationWeights.length > c.constellation) {
        constellationScore += c.constellationWeights[c.constellation]
      } else if (c.constellationWeights && c.constellationWeights.length > 0) {
        // Fallback ke bobot maksimum jika level konstelasi melebihi panjang array
        constellationScore += c.constellationWeights[c.constellationWeights.length - 1]
      } else {
        // Fallback default jika data constellationWeights belum tersedia (2 poin per constalasi)
        constellationScore += c.constellation * 2
      }
    } else if (c.constellationWeights && c.constellationWeights.length > 0) {
       // Constellation 0 may also have a base weight defined in index 0
       constellationScore += c.constellationWeights[0]
    }
  })

  const total = synergyScore + coverageScore + elementScore + contentScore + f2pScore + constellationScore

  return {
    total,
    synergyScore,
    coverageScore,
    elementScore,
    contentScore,
    f2pScore,
    constellationScore
  }
}
