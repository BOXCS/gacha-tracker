'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ResinCard } from '@/components/resin/ResinCard'
import type { GameAccount } from '@/hooks/useAccounts'
import type { DailyTask } from '@/hooks/useTasks'

interface OverviewGridProps {
  accounts: GameAccount[]
  isLoading: boolean
  tasks?: DailyTask[]
  onUpdate: (id: string, currentResin: number) => void
  onInlineUpdate?: (id: string, currentResin?: number, secondaryResin?: number) => Promise<void>
  onDelete: (id: string) => void
  onToggleTask?: (accountId: string, taskKey: string, label: string, isDone: boolean) => void
  onReorder: (updates: { id: string; sort_order: number }[]) => void
  onAddClick: () => void
}

/** Stagger container — children animate in cascading sequence */
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

function EmptyState({ onAddClick }: { onAddClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
      className="col-span-full flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-[--border-default] bg-[--bg-surface] py-24 px-4 text-center shadow-sm"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-[--accent-subtle] ring-8 ring-[--accent-subtle]/50">
          <Zap className="h-10 w-10 text-[--accent-primary]" />
        </div>
        <h3 className="text-xl font-bold text-[--text-primary]">Operasional Terpusat Kosong</h3>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-[--text-muted]">
          Sistem mendeteksi tidak ada entitas yang dilacak. Tambahkan akun pertamamu untuk mulai memantau resin dan menyelesaikan misi harian.
        </p>
      </div>
      
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-[--accent-primary] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
          <span className="relative">Tambahkan Akun Pertama</span>
        </button>
      )}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[--border-default] bg-[--bg-surface] p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-md bg-[--bg-surface-raised]" />
          <div className="h-5 w-20 rounded-full bg-[--bg-surface-raised]" />
        </div>
        <div className="h-6 w-6 rounded-md bg-[--bg-surface-raised]" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-6 w-16 rounded-md bg-[--bg-surface-raised]" />
          <div className="h-4 w-8 rounded-md bg-[--bg-surface-raised]" />
        </div>
        <div className="h-2 w-full rounded-full bg-[--bg-surface-raised]" />
      </div>
      <div className="mt-4 border-t border-[--border-default] pt-3">
        <div className="h-4 w-24 rounded-md bg-[--bg-surface-raised]" />
      </div>
    </div>
  )
}

interface SortableResinCardProps {
  account: GameAccount
  index: number
  tasks: DailyTask[]
  onUpdate: (id: string, currentResin: number) => void
  onInlineUpdate?: (id: string, currentResin?: number, secondaryResin?: number) => Promise<void>
  onDelete: (id: string) => void
  onToggleTask?: (accountId: string, taskKey: string, label: string, isDone: boolean) => void
}

function SortableResinCard({ account, index, tasks, onUpdate, onInlineUpdate, onDelete, onToggleTask }: SortableResinCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: account.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative touch-none">
      <ResinCard
        account={account}
        delay={isDragging ? 0 : index * 0.08}
        tasks={tasks}
        onUpdate={onUpdate}
        onInlineUpdate={onInlineUpdate}
        onDelete={onDelete}
        onToggleTask={onToggleTask}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export function OverviewGrid({ 
  accounts, 
  isLoading, 
  tasks = [], 
  onUpdate, 
  onInlineUpdate, 
  onDelete, 
  onToggleTask, 
  onReorder, 
  onAddClick 
}: OverviewGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = accounts.findIndex((a) => a.id === active.id)
      const newIndex = accounts.findIndex((a) => a.id === over.id)
      
      const newAccounts = [...accounts]
      const [movedItem] = newAccounts.splice(oldIndex, 1)
      newAccounts.splice(newIndex, 0, movedItem)

      const updates = newAccounts.map((acc, idx) => ({ id: acc.id, sort_order: idx }))
      onReorder?.(updates)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState onAddClick={onAddClick} />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={accounts.map((a) => a.id)} strategy={rectSortingStrategy}>
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {accounts.map((account, index) => (
            <SortableResinCard
              key={account.id}
              account={account}
              index={index}
              tasks={tasks.filter((t) => t.account_id === account.id)}
              onUpdate={onUpdate}
              onInlineUpdate={onInlineUpdate}
              onDelete={onDelete}
              onToggleTask={onToggleTask}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  )
}
