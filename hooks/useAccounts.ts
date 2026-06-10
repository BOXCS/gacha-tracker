import useSWR from 'swr'
import type { Database } from '@/supabase/types'

export type GameAccount = Database['public']['Tables']['game_accounts']['Row']

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (json.status === 'error') throw new Error(json.message)
  const data = json.data as GameAccount[]
  // Sort accounts by sort_order ASC, then by created_at DESC
  return data.sort((a, b) => {
    const sortA = a.sort_order ?? 0
    const sortB = b.sort_order ?? 0
    if (sortA !== sortB) return sortA - sortB
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

export function useAccounts() {
  const { data, error, isLoading, mutate } = useSWR('/api/accounts', fetcher)

  const addAccount = async (payload: {
    gameType: GameAccount['game_type']
    nickname: string
    currentResin?: number
    maxResin: number
    secondaryResin?: number | null
    secondaryMax?: number | null
  }) => {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (json.status === 'error') throw new Error(json.message)
    // Optimistic update atau revalidate
    await mutate()
    return json.data as GameAccount
  }

  const updateAccount = async (
    id: string,
    payload: {
      nickname?: string
      currentResin?: number
      maxResin?: number
      secondaryResin?: number | null
      secondaryMax?: number | null
      sortOrder?: number
    }
  ) => {
    // Optimistic UI updates could be added here for better UX
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (json.status === 'error') throw new Error(json.message)
    await mutate()
    return json.data as GameAccount
  }

  const deleteAccount = async (id: string) => {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'DELETE',
    })
    const json = await res.json()
    if (json.status === 'error') throw new Error(json.message)
    await mutate()
  }

  const reorderAccounts = async (updates: { id: string; sort_order: number }[]) => {
    // Optimistic UI update
    const currentData = data ? [...data] : []
    const updatedData = currentData.map(account => {
      const update = updates.find(u => u.id === account.id)
      return update ? { ...account, sort_order: update.sort_order } : account
    }).sort((a, b) => {
      const sortA = a.sort_order ?? 0
      const sortB = b.sort_order ?? 0
      if (sortA !== sortB) return sortA - sortB
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    await mutate(updatedData, false) // Revalidate is false initially

    const res = await fetch('/api/accounts/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    const json = await res.json()
    if (json.status === 'error') {
      await mutate() // Revert back if error
      throw new Error(json.message)
    }
    await mutate()
  }

  return {
    accounts: data ?? [],
    isLoading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    reorderAccounts,
  }
}
