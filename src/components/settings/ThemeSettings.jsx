
import { Check, Moon, Sun } from 'lucide-react'

import SettingsSection from './SettingsSection'
import useTheme from '../../hooks/useTheme'
import { THEME_MODES } from '../../utils/constants'

function ThemeSettings({ onThemeChange }) {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme)
    onThemeChange?.(nextTheme)
  }

  return (
    <SettingsSection
      icon={Sun}
      title="Appearance"
      description="Choose the visual theme for your reading space."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleThemeChange(THEME_MODES.LIGHT)}
          aria-pressed={theme === THEME_MODES.LIGHT}
          className={[
            'flex items-center gap-3 rounded-xl border p-4 text-left transition',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            theme === THEME_MODES.LIGHT
              ? 'border-walnut bg-sand/30 ring-2 ring-walnut/15'
              : 'border-border hover:border-walnut/50',
          ].join(' ')}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parchment text-walnut">
            <Sun className="h-5 w-5" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-text-primary">
              Light
            </span>
            <span className="mt-1 block text-xs text-text-secondary">
              Warm parchment and ivory
            </span>
          </span>

          {theme === THEME_MODES.LIGHT ? (
            <Check
              className="h-5 w-5 shrink-0 text-walnut"
              aria-label="Selected"
            />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => handleThemeChange(THEME_MODES.DARK)}
          aria-pressed={theme === THEME_MODES.DARK}
          className={[
            'flex items-center gap-3 rounded-xl border p-4 text-left transition',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            theme === THEME_MODES.DARK
              ? 'border-walnut bg-sand/30 ring-2 ring-walnut/15'
              : 'border-border hover:border-walnut/50',
          ].join(' ')}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-espresso text-sand">
            <Moon className="h-5 w-5" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-text-primary">
              Dark
            </span>
            <span className="mt-1 block text-xs text-text-secondary">
              A softer low-light appearance
            </span>
          </span>

          {theme === THEME_MODES.DARK ? (
            <Check
              className="h-5 w-5 shrink-0 text-walnut"
              aria-label="Selected"
            />
          ) : null}
        </button>
      </div>
    </SettingsSection>
  )
}

export default ThemeSettings
