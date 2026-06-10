'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatSecondsToHMS } from '@/lib/resin'
import type { ResinStatus } from '@/lib/resin'

interface CountdownTimerProps {
  /** Total seconds remaining until full. 0 means already full. */
  initialSeconds: number
  status: ResinStatus
  className?: string
}

const STATUS_COLOR: Record<ResinStatus, string> = {
  normal: 'text-[--resin-fill]',
  warning: 'text-[--resin-warning]',
  full: 'text-[--resin-critical]',
}

/** Individual digit cell with flip animation */
function Digit({ value }: { value: string }) {
  const prevRef = useRef(value)
  const changed = prevRef.current !== value

  useEffect(() => {
    prevRef.current = value
  }, [value])

  return (
    <span
      key={changed ? value : undefined}
      className="inline-block overflow-hidden tabular-nums"
      style={{
        animation: changed ? 'digit-flip 0.25s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
      }}
    >
      {value}
    </span>
  )
}

export function CountdownTimer({ initialSeconds, status, className }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  // Sync when the initialSeconds prop changes (e.g., after a manual resin update)
  useEffect(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  // Tick every second
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  if (secondsLeft <= 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-mono text-sm font-semibold',
          STATUS_COLOR.full,
          className
        )}
      >
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        PENUH
      </span>
    )
  }

  const hms = formatSecondsToHMS(secondsLeft)
  // hms = "HH:MM:SS" → ["HH", "MM", "SS"] → individual chars for digit-flip
  const [hh, mm, ss] = hms.split(':')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-sm font-semibold',
        STATUS_COLOR[status],
        className
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span aria-label={`Waktu tersisa: ${hms}`}>
        {hh.split('').map((c, i) => <Digit key={`h${i}`} value={c} />)}
        <span className="opacity-60">:</span>
        {mm.split('').map((c, i) => <Digit key={`m${i}`} value={c} />)}
        <span className="opacity-60">:</span>
        {ss.split('').map((c, i) => <Digit key={`s${i}`} value={c} />)}
      </span>
    </span>
  )
}
