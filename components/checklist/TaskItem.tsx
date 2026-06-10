'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  label: string
  isDone: boolean
  onToggle: () => void
  disabled?: boolean
}

export function TaskItem({ label, isDone, onToggle, disabled }: TaskItemProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors',
        'hover:bg-[--bg-surface-raised]',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      aria-pressed={isDone}
    >
      <div
        className={cn(
          'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors duration-200',
          isDone
            ? 'border-[--accent-primary] bg-[--accent-primary]'
            : 'border-[--border-strong] bg-transparent group-hover:border-[--accent-primary]/60'
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: isDone ? 1 : 0, opacity: isDone ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </motion.div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <span
          className={cn(
            'block truncate text-sm transition-colors duration-200',
            isDone ? 'text-[--text-muted]' : 'text-[--text-primary]'
          )}
        >
          {label}
        </span>
        
        {/* Animated Strikethrough line */}
        <motion.div
          className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-[--text-muted]"
          initial={false}
          animate={{ scaleX: isDone ? 1 : 0, opacity: isDone ? 1 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ originX: 0 }}
        />
      </div>
    </button>
  )
}
