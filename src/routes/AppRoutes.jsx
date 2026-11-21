import { Route, Routes } from 'react-router-dom'

import { ROUTES } from './routeConfig'

import Dashboard from '../features/dashboard/Dashboard'
import Library from '../features/library/Library'
import Explore from '../features/explore/Explore'
import BookDetails from '../features/book-details/BookDetails'
import ReadingTracker from '../features/tracker/ReadingTracker'
import ReadingGoals from '../features/goals/ReadingGoals'
import Statistics from '../features/statistics/Statistics'
import Wishlist from '../features/wishlist/Wishlist'
import Settings from '../features/settings/Settings'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-semibold text-caramel">404</p>

      <h1 className="mt-4 text-3xl font-semibold text-espresso">
        Page not found
      </h1>

      <p className="mt-3 text-text-secondary">
        The page you're looking for doesn't exist.
      </p>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

      <Route path={ROUTES.LIBRARY} element={<Library />} />

      <Route path={ROUTES.EXPLORE} element={<Explore />} />

      <Route path={ROUTES.BOOK_DETAILS} element={<BookDetails />} />

      <Route path={ROUTES.TRACKER} element={<ReadingTracker />} />

      <Route path={ROUTES.GOALS} element={<ReadingGoals />} />

      <Route path={ROUTES.STATISTICS} element={<Statistics />} />

      <Route path={ROUTES.WISHLIST} element={<Wishlist />} />

      <Route path={ROUTES.SETTINGS} element={<Settings />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
