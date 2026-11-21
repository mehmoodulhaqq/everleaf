import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'

import { NAVIGATION_ITEMS } from '../../routes/routeConfig'

const MOBILE_NAV_PATHS = ['/', '/library', '/explore', '/tracker']

const MORE_NAV_PATHS = ['/wishlist', '/goals', '/statistics', '/settings']

const MOBILE_LABELS = {
  '/': 'Home',
  '/library': 'Library',
  '/explore': 'Explore',
  '/tracker': 'Tracker',
}

function MobileNavigation() {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const location = useLocation()

  const mobileItems = NAVIGATION_ITEMS.filter((item) =>
    MOBILE_NAV_PATHS.includes(item.path),
  )

  const moreItems = NAVIGATION_ITEMS.filter((item) =>
    MORE_NAV_PATHS.includes(item.path),
  )

  const isMoreActive = MORE_NAV_PATHS.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(path + '/'),
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[var(--z-sidebar)] border-t border-border bg-surface/95 backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="relative">
        {isMoreOpen && (
          <div
            id="mobile-more-menu"
            className="absolute bottom-full right-3 mb-3 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl"
          >
            <ul className="space-y-1">
              {moreItems.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMoreOpen(false)}
                      className={({ isActive }) =>
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ' +
                        (isActive
                          ? 'bg-sand text-walnut'
                          : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary')
                      }
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <ul className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
          {mobileItems.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setIsMoreOpen(false)}
                  className={({ isActive }) =>
                    'flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ' +
                    (isActive
                      ? 'text-walnut'
                      : 'text-text-muted hover:text-text-primary')
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-none">
                    {MOBILE_LABELS[item.path]}
                  </span>
                </NavLink>
              </li>
            )
          })}

          <li>
            <button
              type="button"
              onClick={() => setIsMoreOpen((open) => !open)}
              aria-expanded={isMoreOpen}
              aria-controls="mobile-more-menu"
              aria-label="More navigation options"
              className={
                'flex min-h-[64px] w-full flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ' +
                (isMoreActive || isMoreOpen
                  ? 'text-walnut'
                  : 'text-text-muted hover:text-text-primary')
              }
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">More</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default MobileNavigation
