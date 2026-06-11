'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { getGameConfig } from '@/lib/games'
import type { GameAccount } from '@/hooks/useAccounts'
import { computeSecondsToFull } from '@/lib/resin'

interface UpdateResinDialogProps {
  account: GameAccount
  computedResin: number
  computedSecondary?: number
  onClose: () => void
  onUpdate: (currentResin: number, secondaryResin?: number) => Promise<void>
}

function formatTime(totalSeconds: number) {
  if (totalSeconds <= 0) return 'Penuh'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
}

export function UpdateResinDialog({
  account,
  computedResin,
  computedSecondary,
  onClose,
  onUpdate,
}: UpdateResinDialogProps) {
  const config = getGameConfig(account.game_type)
  const [resin, setResin] = useState(computedResin)
  const [secondary, setSecondary] = useState(computedSecondary ?? 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary')

  const hasSecondary = config.secondaryResource != null && account.secondary_max != null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onUpdate(resin, hasSecondary ? secondary : undefined)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Preview countdown
  const now = new Date()
  const primarySeconds = computeSecondsToFull(resin, account.max_resin, now.toISOString(), config.regenRateSeconds, now)
  const secondarySeconds = hasSecondary && config.secondaryResource 
    ? computeSecondsToFull(secondary, account.secondary_max!, now.toISOString(), config.secondaryResource.regenRateSeconds, now)
    : 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[--border-default] bg-[--bg-surface] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[--border-default] px-6 py-4">
            <h2 className="text-lg font-bold text-[--text-primary]">Update Manual</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-[--text-muted] transition-colors hover:bg-[--bg-surface-raised] hover:text-[--text-primary]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {hasSecondary && (
              <div className="mb-6 flex space-x-1 rounded-lg bg-[--bg-surface-raised] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('primary')}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'primary' ? 'bg-[--bg-surface] text-[--text-primary] shadow' : 'text-[--text-muted] hover:text-[--text-primary]'
                  }`}
                >
                  {config.resinLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('secondary')}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'secondary' ? 'bg-[--bg-surface] text-[--text-primary] shadow' : 'text-[--text-muted] hover:text-[--text-primary]'
                  }`}
                >
                  {config.secondaryResource?.label}
                </button>
              </div>
            )}

            <div className={activeTab === 'primary' ? 'block' : 'hidden'}>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <label className="text-sm font-medium text-[--text-muted] uppercase tracking-wider">{config.resinLabel}</label>
                  <p className="mt-1 text-xs text-[--text-muted]">Estimasi penuh: <strong className="text-[--text-primary]">{formatTime(primarySeconds)}</strong></p>
                </div>
                <div className="flex items-baseline">
                  <input
                    type="number"
                    min={0}
                    max={account.max_resin}
                    value={resin}
                    onChange={(e) => setResin(Math.min(account.max_resin, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 border-b-2 border-[--accent-primary] bg-transparent text-right text-3xl font-bold font-mono text-[--text-primary] focus:outline-none"
                  />
                  <span className="ml-1 text-sm text-[--text-muted]">/ {account.max_resin}</span>
                </div>
              </div>
              
              <input
                type="range"
                min={0}
                max={account.max_resin}
                value={resin}
                onChange={(e) => setResin(parseInt(e.target.value))}
                className="w-full accent-[--accent-primary]"
              />
            </div>

            {hasSecondary && config.secondaryResource && account.secondary_max && (
              <div className={activeTab === 'secondary' ? 'block' : 'hidden'}>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <label className="text-sm font-medium text-[--text-muted] uppercase tracking-wider">{config.secondaryResource.label}</label>
                    <p className="mt-1 text-xs text-[--text-muted]">Estimasi penuh: <strong className="text-[--text-primary]">{formatTime(secondarySeconds)}</strong></p>
                  </div>
                  <div className="flex items-baseline">
                    <input
                      type="number"
                      min={0}
                      max={account.secondary_max}
                      value={secondary}
                      onChange={(e) => setSecondary(Math.min(account.secondary_max!, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-16 border-b-2 border-[--accent-primary] bg-transparent text-right text-3xl font-bold font-mono text-[--text-primary] focus:outline-none"
                    />
                    <span className="ml-1 text-sm text-[--text-muted]">/ {account.secondary_max}</span>
                  </div>
                </div>
                
                <input
                  type="range"
                  min={0}
                  max={account.secondary_max}
                  value={secondary}
                  onChange={(e) => setSecondary(parseInt(e.target.value))}
                  className="w-full accent-[--accent-primary]"
                />
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm font-medium text-[--text-muted] transition-colors hover:bg-[--bg-surface-raised] hover:text-[--text-primary]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-md bg-[--accent-primary] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
