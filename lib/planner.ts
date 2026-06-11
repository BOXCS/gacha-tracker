import { type GameType } from './games'
import { DOMAIN_SCHEDULE, type DomainDay } from './games/domains'
import { getCurrentGameDate } from './reset'

/**
 * Mendapatkan daftar domain yang tersedia "hari ini" berdasarkan server time game.
 * @param gameType Jenis game
 * @param now Waktu saat ini (default: Date.now())
 */
export function getTodayDomains(gameType: GameType, now: Date | number = Date.now()): DomainDay[] {
  const gameDateStr = getCurrentGameDate(gameType, new Date(now))
  
  const [yyyy, mm, dd] = gameDateStr.split('-').map(Number)
  const gameTime = new Date(Date.UTC(yyyy, mm - 1, dd))
  
  // getUTCDay() returns 0 = Sunday, 1 = Monday...
  const dayOfWeek = gameTime.getUTCDay()
  
  const schedule = DOMAIN_SCHEDULE[gameType]
  if (!schedule) return []
  
  return schedule[dayOfWeek] || []
}
