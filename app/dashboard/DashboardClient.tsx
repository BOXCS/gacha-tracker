'use client'

import { useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Zap, Plus, RefreshCw, X, Settings, LineChart as LineChartIcon, Calculator } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useTasks } from '@/hooks/useTasks'
import { getCurrentGameDate, getWeeklyResetDate } from '@/lib/reset'
import { OverviewGrid } from '@/components/dashboard/OverviewGrid'
import { SettingsModal } from '@/components/dashboard/SettingsModal'
import { ServerResetCountdown } from '@/components/dashboard/ServerResetCountdown'
import { getGameConfig } from '@/lib/games'
import type { GameType } from '@/lib/games'
import Link from 'next/link'

// ─── Add Account Modal ────────────────────────────────────────────────────────

const SUPPORTED_GAMES: { id: GameType; label: string }[] = [
  { id: 'genshin', label: 'Genshin Impact' },
  { id: 'hsr', label: 'Honkai: Star Rail' },
  { id: 'zzz', label: 'Zenless Zone Zero' },
  { id: 'wuwa', label: 'Wuthering Waves' },
  { id: 'nte', label: 'Neverness to Everness' },
  { id: 'endfield', label: 'Arknights: Endfield' },
]

interface AddAccountModalProps {
  onClose: () => void
  onAdd: (gameType: GameType, nickname: string, currentResin: number, maxResin: number, secondaryResin?: number, secondaryMax?: number) => Promise<void>
}

function AddAccountModal({ onClose, onAdd }: AddAccountModalProps) {
  const [gameType, setGameType] = useState<GameType>('genshin')
  const [nickname, setNickname] = useState('')
  const [currentResin, setCurrentResin] = useState(0)
  const [secondaryResin, setSecondaryResin] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const config = getGameConfig(gameType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) { setError('Nickname tidak boleh kosong.'); return }
    setLoading(true)
    setError('')
    try {
      await onAdd(gameType, nickname.trim(), currentResin, config.defaultMaxResin, secondaryResin, config.secondaryResource?.defaultMax)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan akun.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-account-title"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-account-title" className="text-lg font-semibold text-[--text-primary]">
            Tambah Akun Game
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[--text-muted] hover:bg-[--bg-surface-raised] hover:text-[--text-primary] transition-colors"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game selector */}
          <div>
            <label htmlFor="game-type" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
              Game
            </label>
            <select
              id="game-type"
              value={gameType}
              onChange={(e) => setGameType(e.target.value as GameType)}
              className="w-full rounded-md border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--accent-primary] transition-shadow"
            >
              {SUPPORTED_GAMES.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* Nickname */}
          <div>
            <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
              Nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Zaky@Asia"
              maxLength={50}
              required
              className="w-full rounded-md border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[--accent-primary] transition-shadow"
            />
          </div>

          {/* Current resin */}
          <div>
            <label htmlFor="current-resin" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
              {config.resinLabel} saat ini
              <span className="ml-1 text-xs text-[--text-muted]">(0 – {config.defaultMaxResin})</span>
            </label>
            <input
              id="current-resin"
              type="number"
              value={currentResin}
              onChange={(e) => setCurrentResin(Number(e.target.value))}
              min={0}
              max={config.defaultMaxResin}
              className="w-full rounded-md border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 font-mono text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--accent-primary] transition-shadow"
            />
          </div>

          {/* Secondary Resource (if game supports it) */}
          {config.secondaryResource && (
            <div>
              <label htmlFor="current-secondary" className="mb-1.5 block text-sm font-medium text-[--text-primary]">
                {config.secondaryResource.label} Saat Ini
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="current-secondary"
                  type="number"
                  min="0"
                  max={config.secondaryResource.defaultMax}
                  value={secondaryResin}
                  onChange={(e) => setSecondaryResin(Number(e.target.value))}
                  className="w-full rounded-md border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--accent-primary]"
                />
                <span className="text-sm text-[--text-muted]">/ {config.secondaryResource.defaultMax}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[--state-danger] dark:bg-red-900/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            id="add-account-submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[--accent-primary] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? 'Menyimpan...' : 'Tambah Akun'}
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Dashboard Client ─────────────────────────────────────────────────────────

export function DashboardClient() {
  const { accounts, isLoading: accountsLoading, addAccount, updateAccount, updateResin, deleteAccount, reorderAccounts } = useAccounts()
  
  // Asumsi semua game menggunakan timezone server UTC+8 (04:00 AM) yang sama
  // Jadi kita bisa menggunakan 'genshin' untuk mendapatkan gameDate global hari ini
  const [gameDate] = useState(() => getCurrentGameDate('genshin'))
  const [weeklyDate] = useState(() => getWeeklyResetDate('genshin'))
  const { tasks, weeklyTasks, toggleTask, isLoading: tasksLoading } = useTasks(gameDate, weeklyDate)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Sticky header reacts to scroll — hides when scrolling down, appears on up
  const { scrollY } = useScroll()
  const headerBg = useTransform(
    scrollY,
    [0, 60],
    ['rgba(var(--bg-base-rgb, 248,249,251), 0)', 'rgba(var(--bg-base-rgb, 248,249,251), 0.9)']
  )

  const handleUpdateResin = async (id: string, computedResin: number) => {
    await updateAccount(id, { currentResin: computedResin })
  }

  const handleInlineUpdateResin = async (id: string, currentResin?: number, secondaryResin?: number) => {
    await updateResin(id, currentResin, secondaryResin)
  }

  const handleDelete = async (id: string) => {
    await deleteAccount(id)
  }

  const handleAdd = async (
    gameType: GameType,
    nickname: string,
    currentResin: number,
    maxResin: number,
    secondaryResin?: number,
    secondaryMax?: number
  ) => {
    await addAccount({ gameType, nickname, currentResin, maxResin, secondaryResin, secondaryMax })
  }

  return (
    <>
      {/* ── Sticky Header ── */}
      <motion.header
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', backgroundColor: headerBg }}
        className="sticky top-0 z-30 border-b border-[--border-default]/60 transition-colors"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo / brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[--accent-primary]">
                <Zap className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-[--text-primary] hidden sm:inline">Resin Tracker</span>
            </div>
            <ServerResetCountdown />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/calculator"
              className="flex items-center gap-1.5 rounded-md bg-[--bg-surface-raised] border border-[--border-default] px-3 py-1.5 text-sm font-medium text-[--text-primary] shadow-sm transition-colors hover:bg-[--bg-surface-elevated]"
              aria-label="Kalkulator Resin"
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Kalkulator</span>
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-1.5 rounded-md bg-[--bg-surface-raised] border border-[--border-default] px-3 py-1.5 text-sm font-medium text-[--text-primary] shadow-sm transition-colors hover:bg-[--bg-surface-elevated]"
              aria-label="Riwayat Resin"
            >
              <LineChartIcon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Riwayat</span>
            </Link>
            <motion.button
              onClick={() => setShowSettingsModal(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-md bg-[--bg-surface-raised] border border-[--border-default] px-3 py-1.5 text-sm font-medium text-[--text-primary] shadow-sm transition-colors hover:bg-[--bg-surface-elevated]"
              aria-label="Pengaturan Aplikasi"
              style={{ willChange: 'transform' }}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </motion.button>
            <motion.button
              id="add-account-btn"
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-md bg-[--accent-primary] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              aria-label="Tambah akun game baru"
              style={{ willChange: 'transform' }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Tambah Akun</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-[--text-primary]">
            Akun Game
          </h1>
          <p className="mt-1 text-sm text-[--text-muted]">
            {accounts.length > 0
              ? `${accounts.length} akun terdaftar · diperbarui real-time`
              : 'Tambahkan akun game untuk mulai melacak resin.'}
          </p>
        </motion.div>

        {/* Overview grid */}
        <OverviewGrid
          accounts={accounts}
          isLoading={accountsLoading || tasksLoading}
          tasks={tasks}
          weeklyTasks={weeklyTasks}
          onUpdate={handleUpdateResin}
          onInlineUpdate={handleInlineUpdateResin}
          onDelete={handleDelete}
          onToggleTask={toggleTask}
          onReorder={reorderAccounts}
          onAddClick={() => setShowAddModal(true)}
        />
      </main>

      {/* ── Add Account Modal ── */}
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* ── Settings Modal ── */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  )
}
