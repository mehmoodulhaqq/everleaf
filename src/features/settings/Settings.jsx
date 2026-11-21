import { useRef, useState } from 'react'
import {
  BookOpen,
  Check,
  Download,
  FileJson,
  Moon,
  RotateCcw,
  Settings2,
  Sun,
  Upload,
} from 'lucide-react'

import Button from '../../components/common/Button'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import PageHeader from '../../components/common/PageHeader'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'
import useTheme from '../../hooks/useTheme'

import { clearBooks, setBooks } from '../../store/slices/booksSlice'

import { clearSessions, setSessions } from '../../store/slices/sessionsSlice'

import { clearGoals, setGoals } from '../../store/slices/goalsSlice'

import { clearWishlist, setWishlist } from '../../store/slices/wishlistSlice'

import {
  resetPreferences,
  setPreferences,
  updateReadingPreferences,
} from '../../store/slices/preferencesSlice'

import { clearPersistedState } from '../../services/storageService'
import { downloadExport, parseImportFile } from '../../services/exportService'

import {
  APP_DATA_VERSION,
  APP_NAME,
  APP_TAGLINE,
  READING_PREFERENCES,
  THEME_MODES,
} from '../../utils/constants'

const PREFERENCE_FIELDS = [
  {
    key: 'defaultDailyPageTarget',
    label: 'Daily page target',
    description: 'Your preferred number of pages to read each day.',
    suffix: 'pages',
    fallback: READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,
  },
  {
    key: 'defaultMonthlyPageTarget',
    label: 'Monthly page target',
    description: 'Your default monthly reading target.',
    suffix: 'pages',
    fallback: READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,
  },
  {
    key: 'defaultAnnualBookTarget',
    label: 'Annual book target',
    description: 'How many books you aim to complete each year.',
    suffix: 'books',
    fallback: READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
  },
]

const inputClassName = [
  'w-full rounded-lg border border-border bg-surface px-3 py-2.5',
  'text-sm text-text-primary outline-none transition',
  'focus:border-walnut focus:ring-2 focus:ring-walnut/15',
].join(' ')

function getPreferenceValues(preferences) {
  return {
    defaultDailyPageTarget: String(
      preferences?.reading?.defaultDailyPageTarget ??
        READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,
    ),
    defaultMonthlyPageTarget: String(
      preferences?.reading?.defaultMonthlyPageTarget ??
        READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,
    ),
    defaultAnnualBookTarget: String(
      preferences?.reading?.defaultAnnualBookTarget ??
        READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
    ),
  }
}

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand/60 text-walnut">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {children}
    </section>
  )
}

function Settings() {
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()

  const books = useAppSelector((state) => state.books?.items ?? [])
  const sessions = useAppSelector((state) => state.sessions?.items ?? [])
  const goals = useAppSelector((state) => state.goals?.items ?? [])
  const wishlist = useAppSelector((state) => state.wishlist?.items ?? [])

  const preferences = useAppSelector((state) => state.preferences)

  const [preferenceDraft, setPreferenceDraft] = useState(() =>
    getPreferenceValues(preferences),
  )

  const [previousPreferenceValues, setPreviousPreferenceValues] = useState(() =>
    getPreferenceValues(preferences),
  )

  const currentPreferenceValues = getPreferenceValues(preferences)

  if (
    previousPreferenceValues.defaultDailyPageTarget !==
      currentPreferenceValues.defaultDailyPageTarget ||
    previousPreferenceValues.defaultMonthlyPageTarget !==
      currentPreferenceValues.defaultMonthlyPageTarget ||
    previousPreferenceValues.defaultAnnualBookTarget !==
      currentPreferenceValues.defaultAnnualBookTarget
  ) {
    setPreviousPreferenceValues(currentPreferenceValues)
    setPreferenceDraft(currentPreferenceValues)
  }

  const [confirmAction, setConfirmAction] = useState(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const importInputRef = useRef(null)

  const handlePreferenceChange = (key, value) => {
    setPreferenceDraft((current) => ({
      ...current,
      [key]: value,
    }))

    setMessage('')
    setError('')
  }

  const handlePreferenceBlur = (key, fallback) => {
    const value = Number(preferenceDraft[key])

    if (!Number.isInteger(value) || value < 1) {
      setPreferenceDraft((current) => ({
        ...current,
        [key]: String(preferences?.reading?.[key] ?? fallback),
      }))

      setError('Reading targets must be positive whole numbers.')
      return
    }

    dispatch(updateReadingPreferences({ [key]: value }))
    setMessage('Reading preference saved.')
    setError('')
  }

  const handleExport = () => {
    try {
      downloadExport({
        books: { items: books },
        sessions: { items: sessions },
        goals: { items: goals },
        wishlist: { items: wishlist },
        preferences,
      })

      setMessage('Your Everleaf backup has been downloaded.')
      setError('')
    } catch {
      setError('The backup could not be created. Please try again.')
      setMessage('')
    }
  }

  const handleImportSelection = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setIsProcessing(true)
    setMessage('')
    setError('')
    setPendingImport(null)

    try {
      const result = await parseImportFile(file)

      if (!result.valid) {
        setError(result.errors.join(' '))
        return
      }

      setPendingImport(result.data)
      setConfirmAction('import')
    } catch {
      setError('The selected backup could not be processed.')
    } finally {
      setIsProcessing(false)

      // Allow the same file to be selected again after an error.
      event.target.value = ''
    }
  }

  const handleImport = () => {
    if (!pendingImport) return

    dispatch(setBooks(pendingImport.books))
    dispatch(setSessions(pendingImport.sessions))
    dispatch(setGoals(pendingImport.goals))
    dispatch(setWishlist(pendingImport.wishlist))
    dispatch(setPreferences(pendingImport.preferences))

    setPendingImport(null)
    setConfirmAction(null)
    setMessage('Your Everleaf backup has been imported successfully.')
    setError('')
  }

  const handleReset = () => {
    dispatch(clearBooks())
    dispatch(clearSessions())
    dispatch(clearGoals())
    dispatch(clearWishlist())
    dispatch(resetPreferences())

    // Clear the saved keys after Redux has been reset.
    // This prevents the store subscription from immediately
    // writing the old state back into localStorage.
    const cleared = clearPersistedState()

    setConfirmAction(null)
    setPendingImport(null)
    setMessage(
      cleared
        ? 'Everleaf has been reset to its default state.'
        : 'Your application state was reset, but browser storage could not be cleared.',
    )
    setError('')
  }

  const handleConfirm = () => {
    if (confirmAction === 'import') {
      handleImport()
      return
    }

    if (confirmAction === 'reset') {
      handleReset()
    }
  }

  const closeConfirmation = () => {
    setConfirmAction(null)
    setPendingImport(null)
  }

  const confirmationDetails = {
    import: {
      title: 'Import Everleaf backup?',
      description:
        'This will replace your current books, reading sessions, goals, wishlist, and preferences with the selected backup. This action cannot be undone unless you have another backup.',
      confirmLabel: 'Import backup',
      destructive: true,
    },
    reset: {
      title: 'Reset Everleaf?',
      description:
        'This will permanently clear your Everleaf books, reading sessions, goals, wishlist, and preferences from this browser. Your theme will return to its default setting.',
      confirmLabel: 'Reset application',
      destructive: true,
    },
  }

  const activeConfirmation = confirmationDetails[confirmAction]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="YOUR EXPERIENCE"
        title="Settings"
        description="Manage your reading preferences, appearance, and personal Everleaf data."
      />

      {message ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message}</p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SettingsSection
          icon={Sun}
          title="Appearance"
          description="Choose the visual theme for your reading space."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setTheme(THEME_MODES.LIGHT)
                setMessage('Light theme enabled.')
                setError('')
              }}
              aria-pressed={theme === THEME_MODES.LIGHT}
              className={[
                'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                theme === THEME_MODES.LIGHT
                  ? 'border-walnut bg-sand/30 ring-2 ring-walnut/15'
                  : 'border-border hover:border-walnut/50',
              ].join(' ')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-parchment text-walnut">
                <Sun className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">Light</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Warm parchment and ivory
                </p>
              </div>

              {theme === THEME_MODES.LIGHT ? (
                <Check className="h-5 w-5 text-walnut" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme(THEME_MODES.DARK)
                setMessage('Dark theme enabled.')
                setError('')
              }}
              aria-pressed={theme === THEME_MODES.DARK}
              className={[
                'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                theme === THEME_MODES.DARK
                  ? 'border-walnut bg-sand/30 ring-2 ring-walnut/15'
                  : 'border-border hover:border-walnut/50',
              ].join(' ')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-espresso text-sand">
                <Moon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">Dark</p>
                <p className="mt-1 text-xs text-text-secondary">
                  A softer low-light appearance
                </p>
              </div>

              {theme === THEME_MODES.DARK ? (
                <Check className="h-5 w-5 text-walnut" />
              ) : null}
            </button>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={BookOpen}
          title="Reading preferences"
          description="Set your personal default targets. These preferences can guide future reading goals."
        >
          <div className="space-y-4">
            {PREFERENCE_FIELDS.map((field) => (
              <div
                key={field.key}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_150px] sm:items-center"
              >
                <div>
                  <label
                    htmlFor={field.key}
                    className="text-sm font-medium text-text-primary"
                  >
                    {field.label}
                  </label>

                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    {field.description}
                  </p>
                </div>

                <div className="relative">
                  <input
                    id={field.key}
                    type="number"
                    min="1"
                    step="1"
                    value={preferenceDraft[field.key]}
                    onChange={(event) =>
                      handlePreferenceChange(field.key, event.target.value)
                    }
                    onBlur={() =>
                      handlePreferenceBlur(field.key, field.fallback)
                    }
                    className={inputClassName}
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                    {field.suffix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={FileJson}
          title="Data management"
          description="Keep a personal backup of your Everleaf reading data or restore a previous backup."
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-secondary p-4">
              <p className="text-sm font-medium text-text-primary">
                Your current library
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Books', value: books.length },
                  { label: 'Sessions', value: sessions.length },
                  { label: 'Goals', value: goals.length },
                  { label: 'Wishlist', value: wishlist.length },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xl font-semibold tabular-nums text-text-primary">
                      {item.value}
                    </p>
                    <p className="text-xs text-text-secondary">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={handleExport}
                leftIcon={<Download className="h-4 w-4" />}
                fullWidth
              >
                Export backup
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => importInputRef.current?.click()}
                loading={isProcessing}
                disabled={isProcessing}
                leftIcon={<Upload className="h-4 w-4" />}
                fullWidth
              >
                Import backup
              </Button>

              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportSelection}
                className="hidden"
                aria-label="Select an Everleaf JSON backup"
              />
            </div>

            <p className="text-xs leading-5 text-text-muted">
              Backups use JSON format. Importing a backup replaces your current
              Everleaf data. Keep a separate copy of important backups somewhere
              safe.
            </p>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Settings2}
          title="About Everleaf"
          description="A little growth with every page."
        >
          <div className="flex items-center gap-4 rounded-xl bg-surface-secondary p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-espresso text-sand">
              <BookOpen className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold text-text-primary">
                {APP_NAME}
              </h3>

              <p className="mt-1 text-sm text-text-secondary">{APP_TAGLINE}</p>

              <p className="mt-2 text-xs text-text-muted">
                Local reading companion · Data format v{APP_DATA_VERSION}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Everleaf helps you organize your library, track reading sessions,
            set goals, discover books, and reflect on your reading habits. Your
            personal data stays in this browser.
          </p>
        </SettingsSection>
      </div>

      <SettingsSection
        icon={RotateCcw}
        title="Reset application data"
        description="Start fresh by clearing your Everleaf data from this browser."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-text-primary">
              Reset all Everleaf data
            </p>

            <p className="mt-1 text-xs leading-5 text-text-secondary">
              This clears your books, sessions, goals, wishlist, and
              preferences. It does not clear unrelated browser data. Export a
              backup first if you want to keep your records.
            </p>
          </div>

          <Button
            type="button"
            variant="danger"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => setConfirmAction('reset')}
          >
            Reset Everleaf
          </Button>
        </div>
      </SettingsSection>

      <ConfirmDialog
        open={Boolean(activeConfirmation)}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        title={activeConfirmation?.title}
        description={activeConfirmation?.description}
        confirmLabel={activeConfirmation?.confirmLabel}
        cancelLabel="Cancel"
        destructive={activeConfirmation?.destructive}
      />
    </div>
  )
}

export default Settings
