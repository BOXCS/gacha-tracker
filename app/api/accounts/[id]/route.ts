import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { z } from 'zod'


// Validasi input untuk update account
const updateAccountSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  currentResin: z.number().min(0).optional(),
  maxResin: z.number().min(1).optional(),
  secondaryResin: z.number().min(0).optional().nullable(),
  secondaryMax: z.number().min(1).optional().nullable(),
  sortOrder: z.number().optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  const { data: account, error } = await supabase
    .from('game_accounts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 404 })
  }

  return NextResponse.json({ status: 'ok', data: account })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = updateAccountSchema.parse(body)
    const updateData: Record<string, unknown> = {}

    if (parsed.nickname !== undefined) updateData.nickname = parsed.nickname
    if (parsed.maxResin !== undefined) updateData.max_resin = parsed.maxResin
    if (parsed.sortOrder !== undefined) updateData.sort_order = parsed.sortOrder
    
    if (parsed.currentResin !== undefined) {
      updateData.current_resin = parsed.currentResin
      updateData.last_updated_at = new Date().toISOString()
    }
    
    if (parsed.secondaryResin !== undefined) {
      updateData.secondary_resin = parsed.secondaryResin
      updateData.secondary_updated_at = new Date().toISOString()
    }
    
    if (parsed.secondaryMax !== undefined) {
      updateData.secondary_max = parsed.secondaryMax
    }

    const { data: updatedAccount, error } = await supabase
      .from('game_accounts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

    // [NEW] Rekam history jika ada update resin
    if (parsed.currentResin !== undefined) {
      const historyPayload: Record<string, unknown> = {
        account_id: params.id,
        snapshot_resin: parsed.currentResin,
      }
      if (parsed.secondaryResin !== undefined) {
        historyPayload.snapshot_secondary = parsed.secondaryResin
      }
      // Kita jalankan insert tanpa perlu memblokir response jika gagal (meski ditaruh di await tetap aman)
      await supabase.from('resin_history').insert(historyPayload)
    }

    return NextResponse.json({ status: 'ok', data: updatedAccount })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ status: 'error', message: 'Invalid input data', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('game_accounts')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok', data: { success: true } })
}
