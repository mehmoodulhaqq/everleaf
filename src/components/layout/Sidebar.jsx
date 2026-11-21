import { NavLink } from 'react-router-dom'
import { Leaf } from 'lucide-react'

import { NAVIGATION_ITEMS } from '../../routes/routeConfig'

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-[var(--z-sidebar)] hidden w-[var(--sidebar-width)] flex-col border-r border-white/10 bg-espresso text-ivory lg:flex">
      {/* Brand */}
      <div className="flex h-[var(--topbar-height)] items-center px-7">
        <NavLink
          to="/"
          className="flex items-center gap-3"
          aria-label="Everleaf home"
        >
          <Leaf className="h-6 w-6 text-caramel" />

          <span className="font-display text-2xl font-semibold tracking-tight">
            everleaf
          </span>
        </NavLink>
      </div>

      {/* Brand tagline */}
      <div className="px-7 pb-8">
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
  )
}

export default Sidebar
