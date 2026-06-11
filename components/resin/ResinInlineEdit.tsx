'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ResinInlineEditProps {
  current: number
  max: number
  className?: string
  textClassName?: string
  onUpdate?: (newValue: number) => Promise<void>
}

export function ResinInlineEdit({ current, max, className, textClassName, onUpdate }: ResinInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(current.toString())
  const [isUpdating, setIsUpdating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update local value if current prop changes externally
  useEffect(() => {
    if (!isEditing) {
      setValue(current.toString())
    }
  }, [current, isEditing])

  const handleStartEdit = () => {
    if (!onUpdate) return
    setIsEditing(true)
    setValue(current.toString())
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const submitUpdate = async () => {
    if (!onUpdate || isUpdating) return

    let numValue = parseInt(value, 10)
    
    if (isNaN(numValue) || numValue === current) {
      setIsEditing(false)
      setValue(current.toString())
      return
    }

    // Clamp value between 0 and max
    if (numValue < 0) numValue = 0
    if (numValue > max) numValue = max

    setIsUpdating(true)
    try {
      await onUpdate(numValue)
      setIsEditing(false)
      toast.success('Resin berhasil diupdate')
    } catch (err) {
      console.error('Failed to update resin inline:', err)
      // Reset on error
      setValue(current.toString())
      setIsEditing(false)
      toast.error('Gagal mengupdate resin')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitUpdate()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setValue(current.toString())
    }
  }

  if (isEditing) {
    return (
      <div className={cn("relative inline-flex items-center", className)}>
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={submitUpdate}
          onKeyDown={handleKeyDown}
          disabled={isUpdating}
          className={cn(
            "w-12 bg-transparent outline-none p-0 border-b border-[--accent-primary] text-center font-mono focus:ring-0",
            textClassName,
            isUpdating && "opacity-50 cursor-not-allowed"
          )}
        />
        {/* Spinner if updating */}
        {isUpdating && (
          <div className="absolute -right-4 top-1/2 -translate-y-1/2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[--accent-primary] border-t-transparent" />
          </div>
        )}
      </div>
    )
  }

  return (
    <span 
      className={cn(
        "cursor-pointer hover:opacity-80 transition-opacity border-b border-transparent hover:border-[--border-default] pb-0.5 -mb-0.5", 
        className,
        textClassName,
        !onUpdate && "cursor-default hover:border-transparent hover:opacity-100"
      )}
      onClick={handleStartEdit}
      title={onUpdate ? "Klik untuk mengedit" : undefined}
    >
      {current}
    </span>
  )
}
