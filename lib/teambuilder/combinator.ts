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
export async function generateTeamCombinations(
  ownedCharacters: Character[],
  contentType: ContentType,
  teamSize: number = 4,
  onProgress?: (progress: number) => void
): Promise<ScoredTeam[]> {
  // Pre-filter: Utamakan karakter yang relevan dengan konten untuk memangkas kombinasi ekstrim
  let pool = ownedCharacters.filter(c => 
    c.recommendedFor.includes(contentType) || c.recommendedFor.includes('general')
  )
  // Fallback jika roster terlalu sempit
  if (pool.length < teamSize) {
    pool = ownedCharacters
  }
  if (pool.length < teamSize) return []

  const ownedIds = new Set(ownedCharacters.map(c => c.id))
  const rawCombinations = getCombinations(pool, teamSize)
  
  const scoredTeams: ScoredTeam[] = []
  const CHUNK_SIZE = 5000 // Proses 5000 kombinasi per tick
  
  for (let i = 0; i < rawCombinations.length; i += CHUNK_SIZE) {
    const chunk = rawCombinations.slice(i, i + CHUNK_SIZE)
    
    for (const team of chunk) {
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
    
    if (onProgress) {
      onProgress(Math.min(100, Math.round(((i + CHUNK_SIZE) / rawCombinations.length) * 100)))
    }

    // Yield back to main thread to prevent UI freezing
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  // Sort berdasarkan skor tertinggi
  scoredTeams.sort((a, b) => b.score.total - a.score.total)
  return scoredTeams
}
