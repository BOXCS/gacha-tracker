import useSWR from 'swr'
import type { Database } from '@/supabase/types'

type UserRoster = Database['public']['Tables']['user_roster']['Row']

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useRoster(accountId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserRoster[]>(
    accountId ? `/api/roster?accountId=${accountId}` : null,
    fetcher
  )

  const updateCharacter = async (characterId: string, owned: boolean, constellation: number = 0) => {
    if (!accountId) return

    // Optimistic update
    const previousData = data
    mutate(
      (currentData) => {
        const arr = currentData || []
        const existingIdx = arr.findIndex(r => r.character_id === characterId)
        
        const newEntry = {
          id: 'temp-id',
          account_id: accountId,
          character_id: characterId,
          owned,
          constellation,
          created_at: new Date().toISOString()
        }

        if (existingIdx >= 0) {
          const newArr = [...arr]
          newArr[existingIdx] = { ...newArr[existingIdx], owned, constellation }
          return newArr
        }
        return [...arr, newEntry]
      },
      false
    )

    try {
      const res = await fetch('/api/roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: accountId,
          character_id: characterId,
          owned,
          constellation
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update roster')
      }

      const updatedRoster = await res.json()
      
      // Revalidate to get real DB id
      mutate(
        (currentData) => {
          const arr = currentData || []
          return arr.map(r => r.character_id === characterId ? updatedRoster : r)
        },
        false
      )
    } catch (e) {
      // Revert optimistic update
      mutate(previousData, false)
      throw e
    }
  }

  return {
    roster: data || [],
    isLoading,
    isError: error,
    updateCharacter
  }
}
