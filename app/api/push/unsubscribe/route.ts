import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ status: 'error', message: 'Endpoint required' }, { status: 400 })
    }

    const { data: subs, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('user_id', session.user.id)

    if (fetchError) throw fetchError

    const target = subs?.find((s) => s.subscription.endpoint === endpoint)

    if (target) {
      const { error } = await supabase.from('push_subscriptions').delete().eq('id', target.id)
      if (error) throw error
    }

    return NextResponse.json({ status: 'success' })
  } catch (error: unknown) {
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
