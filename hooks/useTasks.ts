import useSWR from 'swr'
import type { Database } from '@/supabase/types'

export type DailyTask = Database['public']['Tables']['daily_tasks']['Row']

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (json.status === 'error') throw new Error(json.message)
  return json.data as DailyTask[]
}

export function useTasks(date: string) {
  const { data, error, isLoading, mutate } = useSWR(
    date ? `/api/tasks?date=${date}` : null,
    fetcher
  )

  const toggleTask = async (
    accountId: string,
    taskKey: string,
    label: string,
    isDone: boolean
  ) => {
    // Optimistic UI update
    await mutate(
      (currentTasks = []) => {
        const existingIndex = currentTasks.findIndex(
          (t) => t.account_id === accountId && t.task_key === taskKey && t.date === date
        )
        if (existingIndex >= 0) {
          const newTasks = [...currentTasks]
          newTasks[existingIndex] = { ...newTasks[existingIndex], is_done: isDone }
          return newTasks
        } else {
          // Add temporary optimistic task
          return [
            ...currentTasks,
            {
              id: 'temp-id-' + Date.now(),
              account_id: accountId,
              task_key: taskKey,
              label,
              date,
              is_done: isDone,
            } as DailyTask,
          ]
        }
      },
      false // do not revalidate immediately
    )

    // Send API request
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, taskKey, label, date, isDone }),
      })
      const json = await res.json()
      if (json.status === 'error') throw new Error(json.message)
      // Revalidate to get the real DB object
      mutate()
    } catch (error) {
      // Revert on error
      mutate()
      throw error
    }
  }

  return {
    tasks: data ?? [],
    isLoading,
    error,
    toggleTask,
  }
}
