import type { Character, ContentType, ScoredTeam } from './types'
import { isValidTeam, scoreTeam } from './rules'
import { categorizeTeam, generateReasonSummary } from './categorizer'

/**
 * Utility untuk menghasilkan semua kombinasi ukuran `k` dari array `arr`.
 */
function getCombinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = []

  function backtrack(start: number, current: T[]) {
    if (current.length === k) {
      result.push([...current])
      return
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i])
      backtrack(i + 1, current)
      current.pop()
    }
  }

  backtrack(0, [])
  return result
}

/**
 * Menghasilkan semua kombinasi tim yang valid dari daftar karakter yang dimiliki,
 * lalu memberikan skor dan kategori untuk masing-masing tim.
 * 
 * Peringatan: array ownedCharacters sebaiknya difilter terlebih dahulu (misal berdasarkan game)
 * agar ukuran tidak terlalu besar.
 */
export function generateTeamCombinations(
  ownedCharacters: Character[],
  contentType: ContentType,
  teamSize: number = 4
): ScoredTeam[] {
  // Hanya proses jika memiliki cukup karakter
  if (ownedCharacters.length < teamSize) return []

  // Ambil ID karakter yang dimiliki untuk mempercepat lookup di scoring
  const ownedIds = new Set(ownedCharacters.map(c => c.id))

  // 1. Generate semua raw combinations
  const rawCombinations = getCombinations(ownedCharacters, teamSize)

  // 2. Filter yang valid dan score sekaligus
  const scoredTeams: ScoredTeam[] = []

  for (const team of rawCombinations) {
    if (isValidTeam(team, contentType)) {
      const score = scoreTeam(team, contentType, ownedIds)
      const category = categorizeTeam(team, score)
      const reasonSummary = generateReasonSummary(team, score, category)

      scoredTeams.push({
        characters: team,
        score,
        category,
        reasonSummary
      })
    }
  }

  // 3. Sort berdasarkan skor tertinggi
  scoredTeams.sort((a, b) => b.score.total - a.score.total)

  return scoredTeams
}
