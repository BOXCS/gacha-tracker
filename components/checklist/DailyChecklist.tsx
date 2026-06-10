'use client'

import { useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { GameType } from '@/lib/games'
import { GAME_TASKS } from '@/lib/games/tasks'
import type { DailyTask } from '@/hooks/useTasks'
import { TaskItem } from './TaskItem'

interface DailyChecklistProps {
  accountId: string
  gameType: GameType
  tasks: DailyTask[]
  onToggle: (accountId: string, taskKey: string, label: string, isDone: boolean) => void
  disabled?: boolean
}

export function DailyChecklist({ accountId, gameType, tasks, onToggle, disabled }: DailyChecklistProps) {
  // Merge default tasks with DB state
  const mergedTasks = useMemo(() => {
    const defaultTasks = GAME_TASKS[gameType] || []
    return defaultTasks.map(dt => {
      const dbTask = tasks.find(t => t.task_key === dt.key)
      return {
        key: dt.key,
        label: dt.label,
        isDone: dbTask?.is_done ?? false
      }
    })
  }, [gameType, tasks])

  if (mergedTasks.length === 0) {
    return null // No daily tasks configured for this game
  }

  const allDone = mergedTasks.length > 0 && mergedTasks.every(t => t.isDone)

  return (
    <div className="flex flex-col gap-1.5 pt-1">
      <div className="mb-1 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-muted]">
          Daily Tasks
        </h3>
        {allDone && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-[--state-success]">
            <CheckCircle2 className="h-3 w-3" />
            Selesai
          </span>
        )}
      </div>
      
      <div className="space-y-0.5">
        {mergedTasks.map(task => (
          <TaskItem
            key={task.key}
            label={task.label}
            isDone={task.isDone}
            disabled={disabled}
            onToggle={() => onToggle(accountId, task.key, task.label, !task.isDone)}
          />
        ))}
      </div>
    </div>
  )
}
