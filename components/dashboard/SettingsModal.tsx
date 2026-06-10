import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { createClient } from '@/supabase/client'
import type { User } from '@supabase/supabase-js'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const { isSupported, subscription, isLoading: pushLoading, subscribeToPush, unsubscribeFromPush } = usePushNotifications()
  const [dailyNotif, setDailyNotif] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function loadSettings() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data } = await supabase
          .from('users')
          .select('daily_reset_notif')
          .eq('id', session.user.id)
          .single()
        if (data) {
          setDailyNotif(data.daily_reset_notif)
        }
      }
    }
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTogglePush = async () => {
    if (subscription) {
      await unsubscribeFromPush()
    } else {
      await subscribeToPush()
    }
  }

  const handleToggleDaily = async () => {
    const newValue = !dailyNotif
    setDailyNotif(newValue)
    if (user) {
      setSavingSettings(true)
      await supabase
        .from('users')
        .update({ daily_reset_notif: newValue })
        .eq('id', user.id)
      setSavingSettings(false)
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
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
      >
        <div className="mb-5 flex items-center justify-between border-b border-[--border-default] pb-4">
          <h2 className="text-lg font-semibold text-[--text-primary]">Pengaturan Aplikasi</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[--text-muted] hover:bg-[--bg-surface-raised] hover:text-[--text-primary] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Web Push Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-surface-raised]">
                <Bell className="h-5 w-5 text-[--text-primary]" />
              </div>
              <div>
                <p className="font-semibold text-[--text-primary]">Notifikasi Resin</p>
                <p className="text-xs text-[--text-muted]">Terima peringatan di perangkat ini</p>
              </div>
            </div>
            {isSupported ? (
              <button
                onClick={handleTogglePush}
                disabled={pushLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  subscription ? 'bg-[--accent-primary]' : 'bg-[--bg-surface-raised] border border-[--border-default]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    subscription ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            ) : (
              <span className="text-xs text-[--state-danger]">Tidak didukung browser</span>
            )}
          </div>

          {/* Daily Reset Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-surface-raised]">
                <Moon className="h-5 w-5 text-[--text-primary]" />
              </div>
              <div>
                <p className="font-semibold text-[--text-primary]">Server Reset (04:00)</p>
                <p className="text-xs text-[--text-muted]">Notifikasi harian saat reset server</p>
              </div>
            </div>
            <button
              onClick={handleToggleDaily}
              disabled={savingSettings}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dailyNotif ? 'bg-[--accent-primary]' : 'bg-[--bg-surface-raised] border border-[--border-default]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dailyNotif ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Tema Aplikasi */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-surface-raised]">
                <Sun className="h-5 w-5 text-[--text-primary] dark:hidden block" />
                <Moon className="h-5 w-5 text-[--text-primary] hidden dark:block" />
              </div>
              <div>
                <p className="font-semibold text-[--text-primary]">Tema Aplikasi</p>
                <p className="text-xs text-[--text-muted]">Terang, Gelap, atau Sistem</p>
              </div>
            </div>
            <div className="flex bg-[--bg-surface-raised] p-1 rounded-lg border border-[--border-default]">
              <button onClick={() => setTheme('light')} className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-[--bg-surface] shadow-sm text-[--text-primary]' : 'text-[--text-muted]'}`} aria-label="Terang">
                <Sun className="h-4 w-4" />
              </button>
              <button onClick={() => setTheme('system')} className={`p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-[--bg-surface] shadow-sm text-[--text-primary]' : 'text-[--text-muted]'}`} aria-label="Sistem">
                <Monitor className="h-4 w-4" />
              </button>
              <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-[--bg-surface] shadow-sm text-[--text-primary]' : 'text-[--text-muted]'}`} aria-label="Gelap">
                <Moon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
