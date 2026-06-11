import { getGameConfig, type GameType } from './games'

/**
 * Returns the current "game date" formatted as YYYY-MM-DD.
 * It takes the game's server reset time into account.
 * 
 * For example, if a game resets at 04:00 AM (UTC+8),
 * at 03:00 AM on Oct 10th, the game date is still Oct 9th.
 */
export function getCurrentGameDate(gameType: GameType, now: Date = new Date()): string {
  const config = getGameConfig(gameType)
  
  // All our supported games reset at 04:00 AM UTC+8.
  // First, we convert `now` to the game's server timezone (Asia/Shanghai is UTC+8).
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: config.serverResets[0].timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    hourCycle: 'h23',
  })

  // Format: "MM/DD/YYYY, HH"
  const parts = formatter.formatToParts(now)
  
  let year = 0, month = 0, day = 0, hour = 0
  
  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value)
    if (part.type === 'month') month = parseInt(part.value)
    if (part.type === 'day') day = parseInt(part.value)
    if (part.type === 'hour') hour = parseInt(part.value)
  }

  // Create a Date object representing the time in the target timezone
  // Note: we treat the local extracted year/month/day as UTC just to do date math
  const gameTime = new Date(Date.UTC(year, month - 1, day, hour))

  // If the current hour is strictly before the reset hour, we subtract 1 day.
  const resetHour = config.serverResets[0].hour
  if (hour < resetHour) {
    gameTime.setUTCDate(gameTime.getUTCDate() - 1)
  }

  const yyyy = gameTime.getUTCFullYear()
  const mm = String(gameTime.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(gameTime.getUTCDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

/**
 * Returns the current "weekly reset date" formatted as YYYY-MM-DD.
 * It always returns the date of the Monday of the current game week.
 * 
 * If the current day is Sunday 03:00 AM, it belongs to the previous Monday.
 * If the current day is Monday 05:00 AM, it belongs to the current Monday.
 */
export function getWeeklyResetDate(gameType: GameType, now: Date = new Date()): string {
  // First, get the current game date (which already accounts for the 04:00 AM reset)
  const gameDateStr = getCurrentGameDate(gameType, now)
  
  // Parse the game date as UTC to do date math
  const [yyyy, mm, dd] = gameDateStr.split('-').map(Number)
  const gameTime = new Date(Date.UTC(yyyy, mm - 1, dd))
  
  // getUTCDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const dayOfWeek = gameTime.getUTCDay()
  
  // Calculate how many days we are past Monday
  // If today is Monday (1), diff is 0
  // If today is Tuesday (2), diff is 1
  // If today is Sunday (0), we want to go back to previous Monday (-6 days), so diff is 6
  const diffFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  
  // Subtract diffFromMonday from the current date
  gameTime.setUTCDate(gameTime.getUTCDate() - diffFromMonday)
  
  const resetYyyy = gameTime.getUTCFullYear()
  const resetMm = String(gameTime.getUTCMonth() + 1).padStart(2, '0')
  const resetDd = String(gameTime.getUTCDate()).padStart(2, '0')
  
  return `${resetYyyy}-${resetMm}-${resetDd}`
}
