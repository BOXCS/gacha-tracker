'use client'

import { useState, useEffect } from 'react'
import { Check, BookOpen, Sword, CircleDollarSign } from 'lucide-react'
import type { DomainDay } from '@/lib/games/domains'

interface DomainCardProps {
  domain: DomainDay
  accountId: string
  gameDate: string
}

export function DomainCard({ domain, accountId, gameDate }: DomainCardProps) {
  const [isDone, setIsDone] = useState(false)
  
  // Storage key is unique per account, domain, and game date
  // This means when gameDate changes (server reset), it will start as false
  const storageKey = `planner_done_${accountId}_${domain.id}_${gameDate}`

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'true') {
      setIsDone(true)
    } else {
      setIsDone(false)
    }
  }, [storageKey])

  const toggleDone = () => {
    const next = !isDone
    setIsDone(next)
    if (next) {
      localStorage.setItem(storageKey, 'true')
    } else {
      localStorage.removeItem(storageKey)
    }
  }

  const getIcon = () => {
    if (domain.type === 'talent') return <BookOpen className="h-4 w-4" />
    if (domain.type === 'weapon') return <Sword className="h-4 w-4" />
    return <CircleDollarSign className="h-4 w-4" />
  }

  return (
    <div 
      className={`relative flex flex-col gap-3 rounded-xl border p-4 transition-all ${
        isDone 
          ? 'border-[--state-success]/50 bg-[--state-success]/5 opacity-70' 
          : 'border-[--border-default] bg-[--bg-surface-raised] hover:border-[--accent-primary]/50 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 flex shrink-0 h-6 w-6 items-center justify-center rounded-md ${
            isDone ? 'bg-[--state-success]/20 text-[--state-success]' : 'bg-[--bg-surface-elevated] text-[--text-muted]'
          }`}>
            {getIcon()}
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${isDone ? 'text-[--state-success]' : 'text-[--text-primary]'}`}>
              {domain.name}
            </h4>
            <p className="mt-1 text-xs text-[--text-muted]">
              Biaya: <span className="font-mono font-medium">{domain.cost}</span> / run
            </p>
          </div>
        </div>

        <button
          onClick={toggleDone}
          className={`flex shrink-0 h-7 w-7 items-center justify-center rounded-full border transition-colors ${
            isDone 
              ? 'border-[--state-success] bg-[--state-success] text-white' 
              : 'border-[--border-default] bg-transparent text-transparent hover:border-[--text-muted]'
          }`}
          aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-auto pt-2 flex flex-wrap gap-1.5">
        {domain.materials.map((mat, i) => (
          <span 
            key={i} 
            className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ${
              isDone ? 'bg-[--state-success]/10 text-[--state-success]' : 'bg-[--bg-surface-elevated] text-[--text-secondary]'
            }`}
          >
            {mat}
          </span>
        ))}
      </div>
    </div>
  )
}
