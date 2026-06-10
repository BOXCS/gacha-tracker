'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, LogIn, UserPlus, RefreshCw } from 'lucide-react'
import { createClient } from '@/supabase/client'

export function LoginClient() {
  const router = useRouter()
  const supabase = createClient()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }
      
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat autentikasi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--bg-base] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[--border-default] bg-[--bg-surface] p-8 shadow-xl dark:glass dark:grain">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[--accent-primary]">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[--text-primary]">
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h1>
          <p className="mt-2 text-sm text-[--text-muted]">
            Pantau resin semua game gacha Anda dalam satu tempat.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-[--text-muted]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-[--border-default] bg-[--bg-surface-raised] p-2.5 pl-10 text-[--text-primary] focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[--text-primary]">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-[--text-muted]" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-[--border-default] bg-[--bg-surface-raised] p-2.5 pl-10 text-[--text-primary] focus:border-[--accent-primary] focus:outline-none focus:ring-1 focus:ring-[--accent-primary]"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[--accent-primary] p-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="h-5 w-5" /> Masuk
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" /> Daftar
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[--text-muted]">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-[--accent-primary] hover:underline"
            >
              {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
