import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { QuickAddMenu } from '@/components/layout/QuickAddMenu'

export function AppLayout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:ml-56 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 pb-24 md:pb-8 px-4 py-6 max-w-2xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav onQuickAdd={() => setQuickAddOpen(true)} />
      <QuickAddMenu open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
