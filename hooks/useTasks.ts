import useSWR from 'swr'
import type { Database } from '@/supabase/types'

export type DailyTask = Database['public']['Tables']['daily_tasks']['Row']

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (json.status === 'error') throw new Error(json.message)
  return json.data as DailyTask[]
}

export function useTasks(date: string, weeklyDate?: string) {
  const query = new URLSearchParams()
  if (date) query.append('date', date)
  if (weeklyDate) query.append('weeklyDate', weeklyDate)
  
  const { data, error, isLoading, mutate } = useSWR(
    date ? `/api/tasks?${query.toString()}` : null,
    fetcher
  )

  const toggleTask = async (
    accountId: string,
    taskKey: string,
    label: string,
    isDone: boolean,
    taskType: 'daily' | 'weekly' = 'daily'
  ) => {
    // Optimistic UI update
    const targetDate = taskType === 'weekly' && weeklyDate ? weeklyDate : date
    
    await mutate(
      (currentTasks = []) => {
        const existingIndex = currentTasks.findIndex(
          (t) => t.account_id === accountId && t.task_key === taskKey && t.date === targetDate && t.task_type === taskType
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
              date: targetDate,
              is_done: isDone,
              task_type: taskType,
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
        body: JSON.stringify({ accountId, taskKey, label, date: targetDate, isDone, taskType }),
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

  const allTasks = data ?? []
  const dailyTasks = allTasks.filter(t => t.task_type === 'daily' || !t.task_type)
  const weeklyTasks = allTasks.filter(t => t.task_type === 'weekly')

  return {
    tasks: dailyTasks,
    weeklyTasks,
    isLoading,
    error,
    toggleTask,
  }
}
