import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function ServerResetCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function updateCountdown() {
      const now = new Date()
      // Server reset is at 04:00 AM UTC+8
      // Create a Date object for the next reset
      const resetTime = new Date()
      // Convert to UTC+8
      const utcOffset = resetTime.getTimezoneOffset() * 60000
      const utcTime = resetTime.getTime() + utcOffset
      const utc8Time = new Date(utcTime + 8 * 3600000)

      const targetUtc8 = new Date(utc8Time)
      if (targetUtc8.getHours() >= 4) {
        // Next reset is tomorrow at 04:00
        targetUtc8.setDate(targetUtc8.getDate() + 1)
      }
      targetUtc8.setHours(4, 0, 0, 0)

      // Convert back to local time to get the diff
      const targetLocalTime = new Date(targetUtc8.getTime() - 8 * 3600000 - utcOffset)
      
      let diff = targetLocalTime.getTime() - now.getTime()
      if (diff < 0) diff = 0

      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[--bg-surface-raised] border border-[--border-default] px-3 py-1.5 text-sm font-medium text-[--text-muted]">
      <Clock className="h-3.5 w-3.5 text-[--accent-primary]" />
      <span>Reset: {timeLeft}</span>
    </div>
  )
}
