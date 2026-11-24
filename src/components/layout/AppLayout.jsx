import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNavigation from './MobileNavigation'
import PageContainer from './PageContainer'

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main application area */}
      <div className="min-h-screen lg:pl-[var(--sidebar-width)]">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <PageContainer className="pb-28 lg:pb-8">
          <Outlet />
        </PageContainer>
      </div>

      {/* Mobile navigation */}
      <MobileNavigation />
    </div>
  )
}

export default AppLayout