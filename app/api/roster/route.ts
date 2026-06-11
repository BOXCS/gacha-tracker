import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { z } from 'zod'

const rosterSchema = z.object({
  account_id: z.string().uuid(),
  character_id: z.string(),
  owned: z.boolean(),
  constellation: z.number().min(0).max(6).optional()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId parameter' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify account ownership
    const { data: account } = await supabase
      .from('game_accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (!account) {
      return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 })
    }

    const { data: roster, error } = await supabase
      .from('user_roster')
      .select('*')
      .eq('account_id', accountId)

    if (error) throw error

    return NextResponse.json(roster)
  } catch (error: unknown) {
    console.error('Failed to fetch roster:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch roster' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = rosterSchema.parse(body)

    // Verify account ownership
    const { data: account } = await supabase
      .from('game_accounts')
      .select('id')
      .eq('id', validated.account_id)
      .eq('user_id', user.id)
      .single()

    if (!account) {
      return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 })
    }

    // Upsert roster entry
    const { data, error } = await supabase
      .from('user_roster')
      .upsert({
        account_id: validated.account_id,
        character_id: validated.character_id,
        owned: validated.owned,
        constellation: validated.constellation ?? 0
      }, {
        onConflict: 'account_id,character_id'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Failed to update roster:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update roster' }, { status: 500 })
  }
}
