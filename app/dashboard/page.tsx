import { DashboardClient } from './DashboardClient'

/**
 * Server Component shell — keeps the page server-renderable.
 * All interactivity delegated to DashboardClient.
 */
export default function DashboardPage() {
  return <DashboardClient />
}
