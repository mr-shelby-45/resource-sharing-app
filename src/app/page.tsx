import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/currentUser'
import PageHeader from './components/PageHeader'
import MyItemsSection from './components/dashboard/MyItemsSection'
import ActionNeededSection from './components/dashboard/ActionNeededSection'
import MyBookingsSection from './components/dashboard/MyBookingsSection'
import AvailableItemsSection from './components/dashboard/AvailableItemsSection'

// The dashboard only decides who you are and which sections you see.
// Each section loads its own data, and a failure falls through to error.tsx.
export default async function HomePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (!user.canBorrow && !user.canList) {
    return (
      <div className="page">
        <PageHeader title={`Hey, ${user.name}`} subtitle="You have been banned from this website. Contact admin." />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title={`Welcome back, ${user.name}`}
        subtitle={user.canList ? 'Manage your items and booking requests' : 'Browse available items and track your bookings'}>
        <Link href="/items" className="link-strong">Browse all community items →</Link>
      </PageHeader>

      {/* tasks on the left, things on the right; stacks on phones */}
      <div className="home-layout">
        <div>
          {user.canList && <ActionNeededSection userId={user.id} />}
          <MyBookingsSection userId={user.id} />
        </div>
        <div>
          {user.canList && <MyItemsSection userId={user.id} />}
          <AvailableItemsSection userId={user.id} />
        </div>
      </div>
    </div>
  )
}
