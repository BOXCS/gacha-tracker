import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/client'

export async function PATCH(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { updates } = await request.json() as { updates: { id: string; sort_order: number }[] }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ status: 'error', message: 'Invalid payload' }, { status: 400 })
    }

    // Since Supabase REST doesn't support bulk update easily without RPC,
    // and the number of accounts is small (usually < 10), we can just do Promise.all
    const promises = updates.map((update) =>
      supabase
        .from('game_accounts')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
        .eq('user_id', session.user.id) // Ensure security
    )

    await Promise.all(promises)

    return NextResponse.json({ status: 'success', data: null })
  } catch (error: unknown) {
    return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
