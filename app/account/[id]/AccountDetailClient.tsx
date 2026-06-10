'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Save, Trash2, RefreshCw } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTasks } from '@/hooks/useTasks'
import { getCurrentGameDate } from '@/lib/reset'
import { getGameConfig } from '@/lib/games'
import { GameBadge } from '@/components/dashboard/GameBadge'
import { ResinProgress } from '@/components/resin/ResinProgress'
import { CountdownTimer } from '@/components/resin/CountdownTimer'
import { DailyChecklist } from '@/components/checklist/DailyChecklist'
import { computeResin, computeSecondsToFull, computeResinPercent, getResinStatus } from '@/lib/resin'
import { cn } from '@/lib/utils'

interface Props { accountId: string }

export function AccountDetailClient({ accountId }: Props) {
  const router = useRouter()
  const { accounts, isLoading: accountsLoading, updateAccount, deleteAccount } = useAccounts()
  
  const [gameDate] = useState(() => getCurrentGameDate('genshin'))
  const { tasks, toggleTask } = useTasks(gameDate)

  const account = accounts.find(a => a.id === accountId)
  
  const [nickname, setNickname] = useState('')
  const [maxResin, setMaxResin] = useState(0)
  const [secondaryMax, setSecondaryMax] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync state when account is loaded
  useEffect(() => {
    if (account && !isEditing) {
      setNickname(account.nickname)
      setMaxResin(account.max_resin)
      setSecondaryMax(account.secondary_max || 0)
    }
  }, [account, isEditing])

  if (accountsLoading) return <div className="p-8 text-center text-[--text-muted]">Memuat...</div>
  if (!account) return <div className="p-8 text-center text-[--text-muted]">Akun tidak ditemukan.</div>

  const config = getGameConfig(account.game_type)
  const accountTasks = tasks.filter(t => t.account_id === account.id)

  const now = new Date()
  const computedResin = computeResin(account.current_resin, account.max_resin, account.last_updated_at, config.regenRateSeconds, now)
  const secondsToFull = computeSecondsToFull(account.current_resin, account.max_resin, account.last_updated_at, config.regenRateSeconds, now)
  const percent = computeResinPercent(account.current_resin, account.max_resin, account.last_updated_at, config.regenRateSeconds, now)
  const status = getResinStatus(percent)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload: Record<string, string | number> = { nickname, maxResin }
      if (config.secondaryResource) {
        payload.secondaryMax = secondaryMax
      }
      await updateAccount(accountId, payload)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.')) {
      setIsDeleting(true)
      try {
        await deleteAccount(accountId)
        router.push('/dashboard')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleSyncResin = async () => {
    await updateAccount(accountId, { currentResin: computedResin })
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[--border-default]/60 bg-[rgba(var(--bg-base-rgb),0.9)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3 sm:px-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="mr-3 rounded-md p-1.5 text-[--text-muted] transition-colors hover:bg-[--bg-surface-raised] hover:text-[--text-primary]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-[--text-primary] leading-tight">Detail Akun</h1>
            <span className="text-xs text-[--text-muted]">{account.nickname}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          
          {/* Status Card */}
          <motion.section 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-sm dark:glass dark:grain relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <GameBadge game={account.game_type} className="mb-3" />
                <h2 className="text-2xl font-bold text-[--text-primary]">{account.nickname}</h2>
              </div>
              <button
                onClick={handleSyncResin}
                className="rounded-md p-2 text-[--text-muted] hover:bg-[--bg-surface-raised] hover:text-[--text-primary] transition-colors"
                title="Sync Resin"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 relative z-10">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium uppercase tracking-widest text-[--text-muted]">
                  {config.resinLabel}
                </span>
                <span className="text-sm font-medium text-[--text-muted]">
                  {computedResin} / {account.max_resin}
                </span>
              </div>
              <ResinProgress current={computedResin} max={account.max_resin} status={status} className="h-4" />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[--bg-surface-raised] p-4 relative z-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[--text-muted]">Waktu Penuh</p>
                <div className="mt-1">
                  <CountdownTimer initialSeconds={secondsToFull} status={status} className="text-xl" />
                </div>
              </div>
              {status !== 'normal' && (
                <span className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  status === 'full' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                )}>
                  {status === 'full' ? 'PENUH' : 'HAMPIR PENUH'}
                </span>
              )}
            </div>
            
            {/* Ambient Background Glow based on status */}
            <div className={cn(
              "absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000",
              status === 'full' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'bg-[--accent-primary]'
            )} />
          </motion.section>

          {/* Checklist Section */}
          <motion.section 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-sm"
          >
            <DailyChecklist
              accountId={account.id}
              gameType={account.game_type}
              tasks={accountTasks}
              onToggle={toggleTask}
            />
          </motion.section>

          {/* Settings Section */}
          <motion.section 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[--text-primary] mb-4">Pengaturan Akun</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[--text-primary] mb-1.5">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => { setNickname(e.target.value); setIsEditing(true) }}
                  className="w-full rounded-md border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--accent-primary]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[--text-primary] mb-1.5">Max {config.resinLabel}</label>
                <input
                  type="number"
                  value={maxResin}
                  onChange={(e) => { setMaxResin(Number(e.target.value)); setIsEditing(true) }}
                  disabled={!config.isMaxEditable}
                  className="w-full rounded-md border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm text-[--text-primary] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[--accent-primary]"
                  min={1}
                />
                {!config.isMaxEditable && (
                  <p className="mt-1 text-xs text-[--text-muted]">Batas maksimal ini bersifat tetap untuk game ini.</p>
                )}
              </div>

              {config.secondaryResource && (
                <div>
                  <label className="block text-sm font-medium text-[--text-primary] mb-1.5">Max {config.secondaryResource.label}</label>
                  <input
                    type="number"
                    value={secondaryMax}
                    onChange={(e) => { setSecondaryMax(Number(e.target.value)); setIsEditing(true) }}
                    disabled={!config.secondaryResource.isMaxEditable}
                    className="w-full rounded-md border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm text-[--text-primary] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[--accent-primary]"
                    min={1}
                  />
                  {!config.secondaryResource.isMaxEditable && (
                    <p className="mt-1 text-xs text-[--text-muted]">Batas maksimal ini bersifat tetap.</p>
                  )}
                </div>
              )}

              {isEditing && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-md bg-[--accent-primary] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-red-100 dark:border-red-900/30">
              <h4 className="text-sm font-bold text-[--state-danger] mb-2">Danger Zone</h4>
              <p className="text-sm text-[--text-muted] mb-4">
                Menghapus akun akan menghilangkan semua data riwayat resin dan checklist harian yang terkait.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Menghapus...' : 'Hapus Akun'}
              </button>
            </div>
          </motion.section>

        </div>
      </main>
    </>
  )
}
