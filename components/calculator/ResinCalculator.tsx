'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Save, Clock, Zap, Target } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { GAME_CONFIGS, getGameConfig } from '@/lib/games'
import type { GameType } from '@/lib/games'
import { GAME_ACTIVITIES } from '@/lib/games/activities'
import {
  computeAffordableRuns,
  computeResinNeeded,
  computeWaitTime,
  computeRefreshesNeeded,
} from '@/lib/calculator'
import { computeResin } from '@/lib/resin'

export function ResinCalculator() {
  const { accounts } = useAccounts()
  
  // State
  const [selectedGame, setSelectedGame] = useState<GameType>('genshin')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  
  const [currentResin, setCurrentResin] = useState<number>(0)
  const [customCost, setCustomCost] = useState<number>(20)
  const [targetRuns, setTargetRuns] = useState<number>(1)
  const [isSaved, setIsSaved] = useState(false)
  
  // Derived state
  const config = getGameConfig(selectedGame)
  const activities = GAME_ACTIVITIES[selectedGame] || []
  
  // Handlers
  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGame = e.target.value as GameType
    setSelectedGame(newGame)
    setSelectedAccountId('')
    setCustomCost(GAME_ACTIVITIES[newGame]?.[0]?.cost || 20)
  }

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = e.target.value
    setSelectedAccountId(accountId)
    
    if (accountId) {
      const account = accounts.find(a => a.id === accountId)
      if (account) {
        const resinNow = computeResin(
          account.current_resin,
          account.max_resin,
          account.last_updated_at,
          config.regenRateSeconds,
          new Date()
        )
        setCurrentResin(resinNow)
      }
    }
  }

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cost = Number(e.target.value)
    if (cost > 0) {
      setCustomCost(cost)
    }
  }

  // Load preset on mount
  useEffect(() => {
    const saved = localStorage.getItem('resin-calc-preset')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.gameType) setSelectedGame(parsed.gameType)
        if (parsed.cost) setCustomCost(parsed.cost)
        if (parsed.runs) setTargetRuns(parsed.runs)
      } catch {
        // ignore
      }
    }
  }, [])

  const handleSavePreset = () => {
    localStorage.setItem('resin-calc-preset', JSON.stringify({
      gameType: selectedGame,
      cost: customCost,
      runs: targetRuns
    }))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  // Calculations
  const affordableRuns = computeAffordableRuns(currentResin, customCost)
  const resinNeeded = computeResinNeeded(targetRuns, customCost)
  const waitSeconds = computeWaitTime(currentResin, resinNeeded, config.regenRateSeconds)
  
  const deficit = resinNeeded - currentResin
  const refreshesNeeded = deficit > 0 ? computeRefreshesNeeded(deficit, 60) : 0 // Assuming 60 per refresh

  const formatWaitTime = (seconds: number) => {
    if (seconds <= 0) return 'Siap sekarang'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h} jam ${m} menit`
    return `${m} menit`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-7 space-y-6 rounded-2xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-[--border-default] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-primary]/10">
              <Calculator className="h-5 w-5 text-[--accent-primary]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[--text-primary]">Kalkulator {config.resinLabel}</h2>
              <p className="text-sm text-[--text-muted]">Rencanakan aktivitas harianmu</p>
            </div>
          </div>
          <button
            onClick={handleSavePreset}
            className="flex items-center gap-1.5 rounded-lg border border-[--border-default] bg-[--bg-surface-raised] px-3 py-1.5 text-sm font-medium text-[--text-primary] shadow-sm transition-colors hover:bg-[--bg-surface-elevated] active:scale-95"
            aria-label="Simpan sebagai Preset"
          >
            {isSaved ? (
              <>
                <div className="h-4 w-4 rounded-full bg-[--state-success] flex items-center justify-center">
                  <Calculator className="h-2 w-2 text-white" />
                </div>
                <span className="hidden sm:inline text-[--state-success]">Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-[--text-muted]" />
                <span className="hidden sm:inline">Simpan Preset</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Game Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[--text-primary]">Game</label>
            <select
              value={selectedGame}
              onChange={handleGameChange}
              className="w-full rounded-lg border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
            >
              {Object.values(GAME_CONFIGS).map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Account Selection (Optional) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[--text-primary]">Pilih Akun (Otomatis)</label>
            <select
              value={selectedAccountId}
              onChange={handleAccountChange}
              className="w-full rounded-lg border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
            >
              <option value="">-- Input Manual --</option>
              {accounts.filter(a => a.game_type === selectedGame).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.nickname}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[--border-default] pt-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[--text-primary]">
              {config.resinLabel} Saat Ini
            </label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--text-muted]" />
              <input
                type="number"
                min={0}
                max={config.defaultMaxResin * 2} // Allow slightly more for overflow
                value={currentResin}
                onChange={(e) => setCurrentResin(Number(e.target.value))}
                className="w-full rounded-lg border border-[--border-default] bg-[--bg-surface-raised] pl-9 pr-3 py-2 font-mono text-sm focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[--text-primary]">Target Runs</label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--text-muted]" />
              <input
                type="number"
                min={1}
                max={99}
                value={targetRuns}
                onChange={(e) => setTargetRuns(Number(e.target.value))}
                className="w-full rounded-lg border border-[--border-default] bg-[--bg-surface-raised] pl-9 pr-3 py-2 font-mono text-sm focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-[--border-default] pt-4">
          <label className="text-sm font-medium text-[--text-primary]">Aktivitas / Biaya {config.resinLabel}</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={customCost}
              onChange={handleActivityChange}
              className="flex-1 rounded-lg border border-[--border-default] bg-[--bg-surface-raised] px-3 py-2 text-sm focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
            >
              <option value={-1} disabled>-- Pilih Aktivitas --</option>
              {activities.map(act => (
                <option key={act.id} value={act.cost}>
                  {act.label} ({act.cost})
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-32 shrink-0">
              <input
                type="number"
                min={1}
                value={customCost}
                onChange={(e) => setCustomCost(Number(e.target.value))}
                className="w-full rounded-lg border border-[--border-default] bg-[--bg-surface-raised] pl-3 pr-8 py-2 font-mono text-sm focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[--text-muted] pointer-events-none">
                /run
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Output Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-5 space-y-4"
      >
        <div className="rounded-2xl border border-[--accent-primary]/20 bg-[--accent-primary]/5 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[--accent-primary] uppercase tracking-wider mb-4">
            Hasil Estimasi
          </h3>
          
          <div className="space-y-4">
            {/* Affordable Runs */}
            <div className="flex justify-between items-center pb-4 border-b border-[--border-default]/40">
              <span className="text-sm text-[--text-primary]">Bisa dijalankan saat ini</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-[--text-primary] font-mono">{affordableRuns}</span>
                <span className="text-sm text-[--text-muted] ml-1">kali</span>
              </div>
            </div>

            {/* Total Needed */}
            <div className="flex justify-between items-center pb-4 border-b border-[--border-default]/40">
              <span className="text-sm text-[--text-primary]">Total {config.resinLabel} untuk {targetRuns} run</span>
              <div className="text-right">
                <span className="text-xl font-bold text-[--text-primary] font-mono">{resinNeeded}</span>
              </div>
            </div>

            {/* Wait time or Deficit */}
            <AnimatePresence mode="wait">
              {deficit > 0 ? (
                <motion.div
                  key="deficit"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-[--border-default]/40">
                    <span className="text-sm text-[--state-danger]">Kekurangan</span>
                    <span className="text-lg font-bold text-[--state-danger] font-mono">{deficit}</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-[--border-default]/40">
                    <span className="text-sm text-[--text-primary] flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Waktu Tunggu
                    </span>
                    <span className="text-base font-semibold text-[--text-primary]">{formatWaitTime(waitSeconds)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[--text-primary]">Estimasi Refresh Item</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-[--text-primary] font-mono">{refreshesNeeded}</span>
                      <span className="text-xs text-[--text-muted]">(@60 resin)</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-[--state-success]/10 p-4 mt-2 border border-[--state-success]/20"
                >
                  <div className="flex items-center gap-2 text-[--state-success]">
                    <div className="h-2 w-2 rounded-full bg-[--state-success] animate-pulse" />
                    <span className="font-medium text-sm">{config.resinLabel} Anda sudah cukup!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
