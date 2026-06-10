import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { subscription } = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ status: 'error', message: 'Invalid subscription' }, { status: 400 })
    }

    // Fetch all user's subscriptions to check if this endpoint already exists
    const { data: subs, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('user_id', session.user.id)

    if (fetchError) throw fetchError

    const existing = subs?.find((s) => s.subscription.endpoint === subscription.endpoint)

    if (!existing) {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: session.user.id,
          subscription: subscription,
        })
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
