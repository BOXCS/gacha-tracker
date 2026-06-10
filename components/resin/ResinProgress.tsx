'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ResinStatus } from '@/lib/resin'

interface ResinProgressProps {
  /** Current resin value (already computed from computeResin) */
  current: number
  max: number
  status: ResinStatus
  /** Whether to show the numeric label above the bar */
  showLabel?: boolean
  className?: string
}

const STATUS_BAR_CLASS: Record<ResinStatus, string> = {
  normal: 'resin-shimmer',
  warning: 'resin-shimmer-warning',
  full: 'resin-pulse-critical',
}

const STATUS_TEXT_CLASS: Record<ResinStatus, string> = {
  normal: 'text-[--resin-fill]',
  warning: 'text-[--resin-warning]',
  full: 'text-[--resin-critical]',
}

export function ResinProgress({
  current,
  max,
  status,
  showLabel = true,
  className,
}: ResinProgressProps) {
  const percent = Math.min((current / max) * 100, 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className={cn('font-mono text-lg font-bold leading-none', STATUS_TEXT_CLASS[status])}>
            {current}
            <span className="ml-0.5 text-sm font-normal text-[--text-muted]">/{max}</span>
          </span>
          <span className="font-mono text-xs text-[--text-muted]">
            {Math.round(percent)}%
          </span>
        </div>
      )}

      {/* Track */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full"
        style={{ background: 'var(--resin-empty)' }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Resin: ${current} / ${max}`}
      >
        {/* Fill — hardware accelerated via transform: scaleX */}
        <motion.div
          className={cn('absolute inset-y-0 left-0 w-full origin-left rounded-full', STATUS_BAR_CLASS[status])}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: percent / 100 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ willChange: 'transform' }}
        />
      </div>
    </div>
  )
}
