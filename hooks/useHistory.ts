import useSWR from 'swr'
import { createClient } from '@/supabase/client'

export interface ResinHistory {
  id: string
  account_id: string
  snapshot_resin: number
  snapshot_secondary: number | null
  recorded_at: string
  game_accounts?: {
    nickname: string
    game_type: string
  }
}

export function useHistory() {
  const supabase = createClient()

  const fetcher = async () => {
    // get history from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data, error } = await supabase
      .from('resin_history')
      .select('*, game_accounts(nickname, game_type)')
      .gte('recorded_at', sevenDaysAgo.toISOString())
      .order('recorded_at', { ascending: true })

    if (error) throw error
    return data as ResinHistory[]
  }

  const { data, error, isLoading } = useSWR('resin_history_7d', fetcher)

  return {
    history: data || [],
    isLoading,
    isError: error
  }
}
