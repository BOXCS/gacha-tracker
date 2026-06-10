import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { getGameConfig, type GameType } from '@/lib/games'
import { computeResin } from '@/lib/resin'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@gachatracker.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

  // If CRON_SECRET is set, enforce it. Otherwise, allow (e.g. for local testing/third-party ping)
  if (process.env.CRON_SECRET && !isVercelCron && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  // We need service role to query across all users for cron
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // 1. Fetch all game accounts and their owner's subscriptions
    // Since Supabase doesn't support easy joining from auth.users (unless via RPC or exposing it),
    // we already have the public.users table!
    const { data: accounts, error: accError } = await supabase
      .from('game_accounts')
      .select('*, users!inner(daily_reset_notif)')

    if (accError) throw accError

    const { data: subs, error: subError } = await supabase
      .from('push_subscriptions')
      .select('user_id, subscription')

    if (subError) throw subError

    // Group subscriptions by user_id
    const userSubs = subs?.reduce((acc: Record<string, unknown[]>, sub: Record<string, unknown>) => {
      const userId = sub.user_id as string
      if (!acc[userId]) acc[userId] = []
      acc[userId].push(sub.subscription)
      return acc
    }, {}) || {}

    const notificationsToSend: { sub: unknown; payload: Record<string, string> }[] = []

    // 2. Check Daily Reset (04:00 AM UTC+8 is 20:00 UTC)
    // Run this if the current UTC hour is 20
    if (now.getUTCHours() === 20) {
      // Find users with daily_reset_notif = true
      const resetUsers = new Set<string>()
      accounts?.forEach((acc: Record<string, unknown>) => {
        const usersObj = acc.users as Record<string, unknown> | undefined
        if (usersObj?.daily_reset_notif) resetUsers.add(acc.user_id as string)
      })

      resetUsers.forEach((userId: string) => {
        if (userSubs[userId]) {
          userSubs[userId].forEach((sub: unknown) => {
            notificationsToSend.push({
              sub,
              payload: {
                title: 'Daily Reset!',
                body: 'Server telah di-reset. Waktu yang tepat untuk mengerjakan daily tasks!',
                icon: '/icon-192x192.png'
              }
            })
          })
        }
      })
    }

    // 3. Check Resin thresholds (80%, 90%, 100%)
    accounts?.forEach((acc: Record<string, unknown>) => {
      try {
        const gameType = acc.game_type as GameType
        const currentResin = acc.current_resin as number
        const maxResin = acc.max_resin as number
        const lastUpdated = acc.last_updated_at as string
        const userId = acc.user_id as string
        const nickname = acc.nickname as string

        const config = getGameConfig(gameType)
        const resinNow = computeResin(currentResin, maxResin, lastUpdated, config.regenRateSeconds, now)
        const resin1HourAgo = computeResin(currentResin, maxResin, lastUpdated, config.regenRateSeconds, oneHourAgo)

        const threshold80 = Math.floor(maxResin * 0.8)
        const threshold90 = Math.floor(maxResin * 0.9)
        const threshold100 = maxResin

        let alertType = null

        if (resin1HourAgo < threshold80 && resinNow >= threshold80) alertType = '80%'
        else if (resin1HourAgo < threshold90 && resinNow >= threshold90) alertType = '90%'
        else if (resin1HourAgo < threshold100 && resinNow >= threshold100) alertType = 'Penuh'

        if (alertType && userSubs[userId]) {
          userSubs[userId].forEach((sub: unknown) => {
            notificationsToSend.push({
              sub,
              payload: {
                title: `${config.resinLabel} ${alertType}!`,
                body: `Resin untuk akun ${nickname} telah mencapai ${resinNow}/${maxResin}.`,
                icon: '/icon-192x192.png'
              }
            })
          })
        }
      } catch {
        // Ignore unsupported games or config errors safely
      }
    })

    // 4. Send all notifications via web-push
    const sendPromises = notificationsToSend.map(async (notif) => {
      try {
        await webpush.sendNotification(notif.sub as webpush.PushSubscription, JSON.stringify(notif.payload))
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'statusCode' in err) {
          const webPushError = err as { statusCode: number }
          if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
            // Subscription has expired or is no longer valid
            const subData = notif.sub as { endpoint: string }
            await supabase.from('push_subscriptions').delete().eq('subscription->>endpoint', subData.endpoint)
          }
        }
      }
    })

    await Promise.allSettled(sendPromises)

    return NextResponse.json({ status: 'success', sent: notificationsToSend.length })
  } catch (error: unknown) {
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
