import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { HistoryClient } from './HistoryClient'

export const metadata = {
  title: 'Riwayat Resin',
}

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <HistoryClient />
}
