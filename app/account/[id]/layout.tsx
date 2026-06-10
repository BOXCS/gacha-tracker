import { LenisSWRProvider } from '@/app/dashboard/LenisSWRProvider'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisSWRProvider>
      <div className="min-h-screen bg-[--bg-base] pb-12">
        {children}
      </div>
    </LenisSWRProvider>
  )
}
