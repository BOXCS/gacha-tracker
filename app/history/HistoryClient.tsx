'use client'

import { useHistory } from '@/hooks/useHistory'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export function HistoryClient() {
  const { history, isLoading } = useHistory()

  // Format data for recharts
  const { chartData, accountNames } = useMemo(() => {
    const data: Record<string, string | number>[] = []
    const names = new Set<string>()
    
    if (!isLoading && history.length > 0) {
      const groupedByDate: Record<string, Record<string, number>> = {}

      history.forEach(item => {
        const date = new Date(item.recorded_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
        const accName = item.game_accounts?.nickname || 'Unknown'
        names.add(accName)

        if (!groupedByDate[date]) {
          groupedByDate[date] = { date }
        }
        
        // As data is sorted ascending, this effectively keeps the latest value for that day
        groupedByDate[date][accName] = item.snapshot_resin
      })

      for (const date in groupedByDate) {
        data.push(groupedByDate[date])
      }
    }
    return { chartData: data, accountNames: Array.from(names) }
  }, [history, isLoading])

  // Colors for lines
  const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

  return (
    <div className="min-h-screen bg-[--bg-base]">
      <header className="sticky top-0 z-30 border-b border-[--border-default]/60 bg-[--bg-surface]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="mr-4 p-2 rounded-lg hover:bg-[--bg-surface-raised] transition-colors text-[--text-primary]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-[--text-primary]">Riwayat Resin (7 Hari Terakhir)</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-sm">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="text-[--text-muted]">Memuat data...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-center">
              <span className="text-[--text-muted]">
                Belum ada data riwayat.<br/>Lakukan sinkronisasi atau pembaruan resin di Dashboard untuk mulai melacak.
              </span>
            </div>
          ) : (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-muted)" 
                    tick={{ fill: 'var(--text-muted)' }}
                    tickLine={{ stroke: 'var(--border-default)' }}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    tick={{ fill: 'var(--text-muted)' }}
                    tickLine={{ stroke: 'var(--border-default)' }}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {accountNames.map((name, i) => (
                    <Line 
                      key={name} 
                      type="monotone" 
                      dataKey={name} 
                      stroke={colors[i % colors.length]} 
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
