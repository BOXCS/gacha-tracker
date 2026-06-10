import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { z } from 'zod'

// Validasi input untuk create account
const createAccountSchema = z.object({
  gameType: z.enum(['genshin', 'hsr', 'zzz', 'wuwa', 'nte', 'endfield']),
  nickname: z.string().min(1, 'Nickname tidak boleh kosong').max(50),
  currentResin: z.number().min(0).default(0),
  maxResin: z.number().min(1),
  secondaryResin: z.number().min(0).optional().nullable(),
  secondaryMax: z.number().min(1).optional().nullable(),
  sortOrder: z.number().default(0),
})

export async function GET() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  const { data: accounts, error } = await supabase
    .from('game_accounts')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok', data: accounts })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createAccountSchema.parse(body)

    const insertData = {
      user_id: session.user.id,
      game_type: parsed.gameType,
      nickname: parsed.nickname,
      current_resin: parsed.currentResin,
      max_resin: parsed.maxResin,
      last_updated_at: new Date().toISOString(),
      secondary_resin: parsed.secondaryResin ?? null,
      secondary_max: parsed.secondaryMax ?? null,
      secondary_updated_at: parsed.secondaryResin !== undefined ? new Date().toISOString() : null,
      sort_order: parsed.sortOrder,
    }

    const { data: newAccount, error } = await supabase
      .from('game_accounts')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', data: newAccount }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ status: 'error', message: 'Invalid input data', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}
