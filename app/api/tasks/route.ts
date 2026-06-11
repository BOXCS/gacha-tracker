import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { z } from 'zod'

const getTasksSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  weeklyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD').optional(),
})

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const queryDate = searchParams.get('date')

  try {
    const parsed = getTasksSchema.parse({ date: queryDate, weeklyDate: searchParams.get('weeklyDate') || undefined })

    // RLS will ensure the user only sees tasks for their own accounts
    let query = supabase.from('daily_tasks').select('*')
    
    if (parsed.weeklyDate) {
      query = query.or(`and(date.eq.${parsed.date},task_type.eq.daily),and(date.eq.${parsed.weeklyDate},task_type.eq.weekly)`)
    } else {
      query = query.eq('date', parsed.date).eq('task_type', 'daily')
    }

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', data: tasks })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ status: 'error', message: 'Invalid query', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}

const toggleTaskSchema = z.object({
  accountId: z.string().uuid(),
  taskKey: z.string(),
  label: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isDone: z.boolean(),
  taskType: z.enum(['daily', 'weekly']).default('daily'),
})

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = toggleTaskSchema.parse(body)

    // First check if task exists since we don't have a unique constraint on (account_id, task_key, date)
    const { data: existing } = await supabase
      .from('daily_tasks')
      .select('id')
      .eq('account_id', parsed.accountId)
      .eq('task_key', parsed.taskKey)
      .eq('date', parsed.date)
      .eq('task_type', parsed.taskType)
      .single()

    if (existing) {
      // Update
      const { data: updatedTask, error } = await supabase
        .from('daily_tasks')
        .update({ is_done: parsed.isDone })
        .eq('id', existing.id)
        .select()
        .single()
        
      if (error) return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
      return NextResponse.json({ status: 'ok', data: updatedTask })
    } else {
      // Insert
      const { data: newTask, error } = await supabase
        .from('daily_tasks')
        .insert({
          account_id: parsed.accountId,
          task_key: parsed.taskKey,
          label: parsed.label,
          date: parsed.date,
          is_done: parsed.isDone,
          task_type: parsed.taskType,
        })
        .select()
        .single()
        
      if (error) return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
      return NextResponse.json({ status: 'ok', data: newTask }, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ status: 'error', message: 'Invalid input data', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}
