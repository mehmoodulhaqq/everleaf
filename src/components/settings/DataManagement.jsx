
import { useRef, useState } from 'react'
import {
  Download,
  FileJson,
  RotateCcw,
  Upload,
} from 'lucide-react'

import Button from '../common/Button'
import ConfirmDialog from '../common/ConfirmDialog'
import SettingsSection from './SettingsSection'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'

import { clearBooks, setBooks } from '../../store/slices/booksSlice'
import { clearSessions, setSessions } from '../../store/slices/sessionsSlice'
import { clearGoals, setGoals } from '../../store/slices/goalsSlice'
import { clearWishlist, setWishlist } from '../../store/slices/wishlistSlice'
import {
  resetPreferences,
  setPreferences,
} from '../../store/slices/preferencesSlice'

import { clearPersistedState } from '../../services/storageService'
import {
  downloadExport,
  parseImportFile,
} from '../../services/exportService'

function DataManagement() {
  const dispatch = useAppDispatch()

  const books = useAppSelector((state) => state.books?.items ?? [])
  const sessions = useAppSelector((state) => state.sessions?.items ?? [])
  const goals = useAppSelector((state) => state.goals?.items ?? [])
  const wishlist = useAppSelector((state) => state.wishlist?.items ?? [])
  const preferences = useAppSelector((state) => state.preferences)

  const importInputRef = useRef(null)

  const [confirmAction, setConfirmAction] = useState(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

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
        setError(
          result.errors?.join(' ') ||
            'The selected file is not a valid Everleaf backup.',
        )
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

    // Clear the saved browser state after resetting Redux.
    const cleared = clearPersistedState()

    setConfirmAction(null)
    setPendingImport(null)
    setMessage(
      cleared
        ? 'Everleaf browser data has been reset.'
        : 'The app state was reset, but browser storage could not be cleared.',
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
        'This will replace your currently loaded books, reading sessions, goals, wishlist, and preferences with the selected backup. Export your current data first if you may need it later.',
      confirmLabel: 'Import backup',
      destructive: true,
    },
    reset: {
      title: 'Reset Everleaf browser data?',
      description:
        'This clears the Everleaf data currently stored in this browser, including books, sessions, goals, wishlist, and preferences. It does not delete your Firebase account or remote Firestore documents.',
      confirmLabel: 'Reset browser data',
      destructive: true,
    },
  }

  const activeConfirmation = confirmAction
    ? confirmationDetails[confirmAction]
    : null

  return (
    <>
      <SettingsSection
        icon={FileJson}
        title="Data management"
        description="Create a backup of your currently loaded Everleaf data or restore a previous backup."
      >
        {message ? (
          <p
            role="status"
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
          >
            {message}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <div className="rounded-xl bg-surface-secondary p-4">
          <p className="text-sm font-medium text-text-primary">
            Currently loaded data
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

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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

        <p className="mt-3 text-xs leading-5 text-text-muted">
          Backups use JSON format and include the data currently loaded by the
          app. Keep a separate copy of important backups somewhere safe.
        </p>
        <p className="mt-2 text-xs leading-5 text-text-muted">
          This backup and reset interface currently works with the app's loaded
          Redux data and browser persistence. It is not a cloud Firestore
          export or remote-data deletion tool.
        </p>
      </SettingsSection>

      <SettingsSection
        icon={RotateCcw}
        title="Reset application data"
        description="Clear the Everleaf data currently stored in this browser."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-text-primary">
              Reset browser data
            </p>

            <p className="mt-1 text-xs leading-5 text-text-secondary">
              This clears the locally loaded books, sessions, goals, wishlist,
              and preferences. Export a backup first if you want to keep a
              copy. It does not delete your account or remote Firebase data.
            </p>
          </div>

          <Button
            type="button"
            variant="danger"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              setMessage('')
              setError('')
              setConfirmAction('reset')
            }}
          >
            Reset browser data
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
    </>
  )
}

export default DataManagement
