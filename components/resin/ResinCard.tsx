'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Zap, RefreshCw, Trash2, GripHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  computeResin,
  computeSecondsToFull,
  computeResinPercent,
  getResinStatus,
} from '@/lib/resin'
import { getGameConfig } from '@/lib/games'
import { GameBadge } from '@/components/dashboard/GameBadge'
import { ResinProgress } from './ResinProgress'
import { CountdownTimer } from './CountdownTimer'
import { DailyChecklist } from '@/components/checklist/DailyChecklist'
import type { GameAccount } from '@/hooks/useAccounts'
import type { DailyTask } from '@/hooks/useTasks'

interface ResinCardProps {
  account: GameAccount
  tasks?: DailyTask[]
  onUpdate?: (id: string, currentResin: number) => void
  onDelete?: (id: string) => void
  onToggleTask?: (accountId: string, taskKey: string, label: string, isDone: boolean) => void
  dragHandleProps?: Record<string, unknown>
  /** Animation delay for staggered grid entrance */
  delay?: number
}

/** Magnetic hover: translates the card slightly towards the cursor */
function useMagneticHover(strength = 6) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set(((e.clientX - cx) / rect.width) * strength * 2)
    y.set(((e.clientY - cy) / rect.height) * strength * 2)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { springX, springY, handleMouseMove, handleMouseLeave }
}

export function ResinCard({ account, tasks = [], onUpdate, onDelete, onToggleTask, dragHandleProps, delay = 0 }: ResinCardProps) {
  const config = getGameConfig(account.game_type)

  const now = new Date()
  const computedResin = computeResin(
    account.current_resin,
    account.max_resin,
    account.last_updated_at,
    config.regenRateSeconds,
    now
  )
  const secondsToFull = computeSecondsToFull(
    account.current_resin,
    account.max_resin,
    account.last_updated_at,
    config.regenRateSeconds,
    now
  )
  const percent = computeResinPercent(account.current_resin, account.max_resin, account.last_updated_at, config.regenRateSeconds, now)
  const status = getResinStatus(percent)

  // Secondary resource computation
  const hasSecondary = config.secondaryResource != null && account.secondary_resin != null && account.secondary_max != null
  let computedSecondary = 0
  let secondaryStatus: ReturnType<typeof getResinStatus> = 'normal'
  
  if (hasSecondary && config.secondaryResource && account.secondary_max != null) {
    computedSecondary = computeResin(account.secondary_resin!, account.secondary_max, account.last_updated_at, config.secondaryResource.regenRateSeconds, now)
    const secPercent = computeResinPercent(account.secondary_resin!, account.secondary_max, account.last_updated_at, config.secondaryResource.regenRateSeconds, now)
    secondaryStatus = getResinStatus(secPercent)
  }

  // Animation values for hover
  const { springX, springY, handleMouseMove, handleMouseLeave } = useMagneticHover(4)
  const rotateX = useTransform(springY, [-6, 6], [2, -2])
  const rotateY = useTransform(springX, [-6, 6], [-2, 2])

  const STATUS_GLOW: Record<typeof status, string> = {
    normal: '',
    warning: 'ring-1 ring-[--resin-warning]/30',
    full: 'ring-1 ring-[--resin-critical]/40',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ rotateX, rotateY, willChange: 'transform', perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // Base card styles per ui-context.md
        'relative overflow-hidden rounded-xl',
        'bg-[--bg-surface] dark:bg-[--bg-surface]',
        'border border-[--border-default]',
        // Glassmorphism layer on dark
        'dark:glass dark:grain',
        // Status glow ring
        STATUS_GLOW[status],
        // Hover lift
        'transition-shadow duration-300 hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        // Touch devices — disable heavy hover
        '@media (hover: none) { transform: none !important }'
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <Link 
          href={`/account/${account.id}`}
          className="flex flex-col gap-1 transition-opacity hover:opacity-80"
          title="Lihat detail akun"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[--accent-primary]" aria-hidden="true" />
            <span className="font-semibold text-[--text-primary] leading-none">
              {account.nickname}
            </span>
          </div>
          <GameBadge game={account.game_type} />
        </Link>

        {/* Actions menu */}
        <div className="flex items-center gap-1 -mt-0.5 -mr-1">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing rounded-md p-1.5 text-[--text-muted] transition-colors hover:bg-[--bg-surface-raised] hover:text-[--text-primary]"
              aria-label="Geser untuk mengurutkan"
            >
              <GripHorizontal className="h-3.5 w-3.5" />
            </button>
          )}
          {onUpdate && (
            <button
              onClick={() => onUpdate(account.id, computedResin)}
              className="rounded-md p-1.5 text-[--text-muted] transition-colors hover:bg-[--bg-surface-raised] hover:text-[--text-primary]"
              aria-label="Sync resin sekarang"
              title="Sync resin"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(account.id)}
              className="rounded-md p-1.5 text-[--text-muted] transition-colors hover:bg-red-50 hover:text-[--state-danger] dark:hover:bg-red-900/20"
              aria-label="Hapus akun"
              title="Hapus akun"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Resource label */}
      <div className="px-4 pb-1">
        <span className="text-xs font-medium uppercase tracking-widest text-[--text-muted]">
          {config.resinLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <ResinProgress
          current={computedResin}
          max={account.max_resin}
          status={status}
          showLabel
        />
      </div>

      {/* Secondary Resource (e.g. NTE Character Pixel) */}
      {hasSecondary && config.secondaryResource && account.secondary_max != null && (
        <>
          <div className="px-4 pb-1 pt-1 border-t border-[--border-default]/40 mt-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[--text-muted]">
              {config.secondaryResource.label}
            </span>
          </div>
          <div className="px-4 pb-3">
            <ResinProgress
              current={computedSecondary}
              max={account.secondary_max}
              status={secondaryStatus}
              showLabel
              className="h-1.5"
            />
          </div>
        </>
      )}

      {/* Countdown */}
      <div className="flex items-center justify-between border-t border-[--border-default] px-4 py-2.5">
        <CountdownTimer initialSeconds={secondsToFull} status={status} />
        {status !== 'normal' && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              status === 'full'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            )}
          >
            {status === 'full' ? 'PENUH' : 'HAMPIR PENUH'}
          </span>
        )}
      </div>

      {/* Daily Checklist */}
      {onToggleTask && (
        <div className="border-t border-[--border-default] bg-[--bg-surface-raised]/50 px-3 py-2.5 dark:bg-black/10">
          <DailyChecklist
            accountId={account.id}
            gameType={account.game_type}
            tasks={tasks}
            onToggle={onToggleTask}
          />
        </div>
      )}
    </motion.div>
  )
}
