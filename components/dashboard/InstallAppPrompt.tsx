'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_prompt_dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:w-96 sm:right-6"
        >
          <div className="flex items-center gap-4 rounded-xl border border-[--border-default] bg-[--bg-surface] p-4 shadow-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--accent-subtle]">
              <Download className="h-5 w-5 text-[--accent-primary]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[--text-primary]">Instal Aplikasi</h3>
              <p className="text-xs text-[--text-muted]">Akses lebih cepat via homescreen</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="rounded-lg bg-[--accent-primary] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Instal
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg p-1.5 text-[--text-muted] hover:bg-[--bg-surface-raised] hover:text-[--text-primary] transition-colors"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
