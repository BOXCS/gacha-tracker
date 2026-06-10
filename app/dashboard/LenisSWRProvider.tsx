'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { SWRConfig } from 'swr'

interface LenisSWRProviderProps {
  children: React.ReactNode
}

/**
 * Wraps the dashboard in:
 * 1. Lenis smooth scroll — buttery 60fps scroll across the dashboard
 * 2. SWRConfig — global dedupe interval so multiple components
 *    sharing the same key don't cause duplicate fetches
 */
export function LenisSWRProvider({ children }: LenisSWRProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <SWRConfig value={{ dedupingInterval: 30_000 }}>
      {children}
    </SWRConfig>
  )
}
