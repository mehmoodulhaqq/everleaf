
import {
  House,
  BookOpen,
  Compass,
  BookMarked,
  Target,
  ChartNoAxesCombined,
  Heart,
  UserRound,
  Settings,
} from 'lucide-react'

export const ROUTES = {
  // Main application
  DASHBOARD: '/',
  LIBRARY: '/library',
  EXPLORE: '/explore',
  BOOK_DETAILS: '/books/:bookId',
  TRACKER: '/tracker',
  GOALS: '/goals',
  STATISTICS: '/statistics',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Authentication
  SIGN_UP: '/signup',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
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
    label: 'Profile',
    path: ROUTES.PROFILE,
    icon: UserRound,
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
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.SETTINGS]: 'Settings',
}

export const getPageTitle = (pathname) => {
  if (pathname.startsWith('/books/')) {
    return 'Book Details'
  }

  return PAGE_TITLES[pathname] || 'Everleaf'
}
