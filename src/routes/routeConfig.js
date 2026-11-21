import {
  House,
  BookOpen,
  Compass,
  BookMarked,
  Target,
  ChartNoAxesCombined,
  Heart,
  Settings,
} from 'lucide-react'

export const ROUTES = {
  DASHBOARD: '/',
  LIBRARY: '/library',
  EXPLORE: '/explore',
  BOOK_DETAILS: '/books/:bookId',
  TRACKER: '/tracker',
  GOALS: '/goals',
  STATISTICS: '/statistics',
  WISHLIST: '/wishlist',
  SETTINGS: '/settings',
}

export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: House,
  },
  {
    label: 'My Library',
    path: ROUTES.LIBRARY,
    icon: BookOpen,
  },
  {
    label: 'Explore Books',
    path: ROUTES.EXPLORE,
    icon: Compass,
  },
  {
    label: 'Reading Tracker',
    path: ROUTES.TRACKER,
    icon: BookMarked,
  },
  {
    label: 'Reading Goals',
    path: ROUTES.GOALS,
    icon: Target,
  },
  {
    label: 'Statistics & Insights',
    path: ROUTES.STATISTICS,
    icon: ChartNoAxesCombined,
  },
  {
    label: 'Wishlist',
    path: ROUTES.WISHLIST,
    icon: Heart,
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
  },
]

export const PAGE_TITLES = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.LIBRARY]: 'My Library',
  [ROUTES.EXPLORE]: 'Explore Books',
  [ROUTES.TRACKER]: 'Reading Tracker',
  [ROUTES.GOALS]: 'Reading Goals',
  [ROUTES.STATISTICS]: 'Statistics & Insights',
  [ROUTES.WISHLIST]: 'Wishlist',
  [ROUTES.SETTINGS]: 'Settings',
}

export const getPageTitle = (pathname) => {
  if (pathname.startsWith('/books/')) {
    return 'Book Details'
  }

  return PAGE_TITLES[pathname] || 'Everleaf'
}
