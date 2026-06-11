'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, ArrowRight } from 'lucide-react'

interface RosterSummaryProps {
  accountId: string | null
  ownedCount: number
  totalGameCharacters: number
}

export function RosterSummary({ accountId, ownedCount, totalGameCharacters }: RosterSummaryProps) {
  if (!accountId) return null

  const percentage = totalGameCharacters > 0 ? Math.round((ownedCount / totalGameCharacters) * 100) : 0
  const isShort = ownedCount < 4

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 p-4 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm h-fit sticky top-24 overflow-hidden relative"
    >
      {/* Decorative corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

      <div className="flex items-center gap-2.5 relative">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <Users className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="font-bold text-sm text-foreground">Roster</h3>
      </div>
      
      {/* Count display */}
      <div className="relative">
        <div className="flex items-baseline gap-1">
          <motion.span
            key={ownedCount}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-foreground tabular-nums"
          >
            {ownedCount}
          </motion.span>
          <span className="text-sm font-medium text-muted-foreground">/ {totalGameCharacters}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Karakter dimiliki</p>

        {/* Mini progress bar */}
        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full"
          />
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">{percentage}% koleksi</p>
      </div>

      {/* Warning */}
      {isShort && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2 p-3 rounded-xl bg-amber-500/8 text-amber-400/80 text-xs border border-amber-500/15"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="leading-snug">Butuh minimal 4 karakter untuk membentuk tim yang valid.</p>
        </motion.div>
      )}

      {/* Link */}
      <Link
        href={`/roster?accountId=${accountId}`}
        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground/70 border border-white/8 hover:bg-white/[0.04] hover:text-purple-400 hover:border-purple-500/25 transition-all duration-200 group mt-1"
      >
        <span>Update Roster</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
      </Link>
    </motion.div>
  )
}
