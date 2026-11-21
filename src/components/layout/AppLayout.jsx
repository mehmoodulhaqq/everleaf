import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNavigation from './MobileNavigation'
import PageContainer from './PageContainer'

import AppRoutes from '../../routes/AppRoutes'

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
          <AppRoutes />
        </PageContainer>
      </div>

      {/* Mobile navigation */}
      <MobileNavigation />
    </div>
  )
}

export default AppLayout
