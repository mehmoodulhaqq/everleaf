
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Leaf, Menu, X } from 'lucide-react'

import { NAVIGATION_ITEMS } from '../../routes/routeConfig'

function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:static lg:justify-end lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="everleaf-mobile-navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand accent */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-caramel" />

          <span className="text-xs font-medium text-text-secondary">
            Everleaf
          </span>
        </div>
      </header>

      {/* Mobile navigation backdrop */}
      {isMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[99] cursor-default bg-black/40 lg:hidden"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

      {/* Mobile navigation drawer */}
      <aside
        id="everleaf-mobile-navigation"
        className={`fixed inset-y-0 left-0 z-[100] flex w-[280px] max-w-[85vw] flex-col bg-espresso text-ivory shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        {/* Drawer brand */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-6">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
            aria-label="Everleaf home"
          >
            <Leaf className="h-6 w-6 text-caramel" />

            <span className="font-display text-2xl font-semibold tracking-tight">
              everleaf
            </span>
          </NavLink>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/10 hover:text-ivory focus-visible:outline-2 focus-visible:outline-focus"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Brand tagline */}
        <div className="px-7 pb-8 pt-5">
          <p className="text-xs tracking-wide text-ivory/60">
            A little growth with every page.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4" aria-label="Main navigation">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/40">
            Workspace
          </p>

          <ul className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors duration-200 ${
                        isActive
                          ? 'bg-white/10 text-ivory shadow-sm'
                          : 'text-ivory/65 hover:bg-white/5 hover:text-ivory'
                      }`
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />

                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="px-7 py-6">
          <div className="border-t border-white/10 pt-5">
            <p className="font-display text-sm text-ivory/70">
              Your personal reading space
            </p>

            <p className="mt-1 text-xs text-ivory/40">
              Made for your literary journey.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Topbar
