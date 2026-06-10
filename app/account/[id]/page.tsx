import { AccountDetailClient } from "@/app/account/[id]/AccountDetailClient"

export const metadata = {
  title: 'Detail Akun - Resin Tracker',
}

interface PageProps {
  params: { id: string }
}

export default function AccountDetailPage({ params }: PageProps) {
  return <AccountDetailClient accountId={params.id} />
}
