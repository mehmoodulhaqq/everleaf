import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  LogOut,
  Mail,
  Save,
  UserRound,
} from 'lucide-react'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import {
  getUserProfile,
  signOutUser,
  updateUserProfile,
} from '../../services/authService'
import { ROUTES } from '../../routes/routeConfig'

function getInitials(name) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) || []

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'
  )
}

function getProfileErrorMessage(error) {
  const messages = {
    'auth/requires-recent-login':
      'For security, please sign out and sign in again before changing your profile.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection.',
    'permission-denied':
      'Firestore denied the profile update. Check that the published security rules allow this signed-in user to update their own profile.',
    'auth/profile-sync-failed':
      'Your Firebase profile was updated, but Everleaf could not sync the profile document. Please try saving again.',
    unauthenticated:
      'Your session has expired. Please sign in again.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'We could not complete that profile action. Please try again.'
  )
}

function Profile() {
  const navigate = useNavigate()
  const { user, loading: authLoading, authError } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [hasPhotoError, setHasPhotoError] = useState(false)

  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (authLoading) {
      return undefined
    }

    if (authError) {
      setErrorMessage(
        'We could not verify your account. Please refresh the page and try again.',
      )
      setIsLoadingProfile(false)
      return undefined
    }

    if (!user) {
      navigate(ROUTES.LOGIN, { replace: true })
      return undefined
    }

    let isActive = true

    async function loadProfile() {
      setIsLoadingProfile(true)
      setErrorMessage('')

      try {
        const savedProfile = await getUserProfile()

        if (!isActive) return

        setDisplayName(
          savedProfile?.displayName || user.displayName || '',
        )
        setPhotoURL(savedProfile?.photoURL || user.photoURL || '')
        setHasPhotoError(false)
      } catch (error) {
        console.error('Profile loading error:', error)

        if (isActive) {
          setDisplayName(user.displayName || '')
          setPhotoURL(user.photoURL || '')
          setHasPhotoError(false)
          setErrorMessage(getProfileErrorMessage(error))
        }
      } finally {
        if (isActive) {
          setIsLoadingProfile(false)
        }
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [authError, authLoading, user, navigate])

  const handleSave = async (event) => {
    event.preventDefault()

    setSuccessMessage('')
    setErrorMessage('')

    const normalizedName = displayName.trim()
    const normalizedPhotoURL = photoURL.trim()

    if (normalizedName.length < 2) {
      setErrorMessage('Your name must contain at least 2 characters.')
      return
    }

    if (normalizedPhotoURL) {
      try {
        const parsedURL = new URL(normalizedPhotoURL)

        if (!['http:', 'https:'].includes(parsedURL.protocol)) {
          throw new Error('Unsupported image URL protocol.')
        }
      } catch {
        setErrorMessage(
          'Please enter a valid image URL beginning with https:// or http://.',
        )
        return
      }
    }

    setIsSaving(true)

    try {
      await updateUserProfile({
        displayName: normalizedName,
        photoURL: normalizedPhotoURL || null,
      })

      setDisplayName(normalizedName)
      setPhotoURL(normalizedPhotoURL)
      setHasPhotoError(false)
      setSuccessMessage('Your profile has been updated successfully.')
    } catch (error) {
      console.error('Profile update error:', error)
      setErrorMessage(getProfileErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    setIsSigningOut(true)

    try {
      await signOutUser()
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      console.error('Profile sign-out error:', error)
      setErrorMessage(getProfileErrorMessage(error))
      setIsSigningOut(false)
    }
  }

  if (authLoading || isLoadingProfile) {
    return (
      <main
        className="flex min-h-[60vh] items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-border border-t-caramel" />
          <p className="text-sm text-text-secondary">
            Loading your profile...
          </p>
        </div>
      </main>
    )
  }

  if (authError) {
    return (
      <main className="mx-auto w-full max-w-3xl">
        <div
          className="rounded-xl border border-danger/20 bg-danger/5 p-5 text-sm text-danger"
          role="alert"
        >
          {errorMessage}
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const showPhoto = Boolean(photoURL) && !hasPhotoError

  return (
    <main className="mx-auto w-full max-w-3xl">
      <div className="mb-7">
        <Link
          to={ROUTES.DASHBOARD}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Everleaf
        </Link>

        <h1 className="font-display text-3xl font-semibold text-text-primary">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Manage the personal details associated with your Everleaf account.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border bg-surface-secondary px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-caramel/15">
              {showPhoto ? (
                <img
                  src={photoURL}
                  alt="Your profile"
                  className="h-full w-full object-cover"
                  onError={() => setHasPhotoError(true)}
                />
              ) : (
                <span className="font-display text-2xl font-semibold text-caramel">
                  {getInitials(displayName)}
                </span>
              )}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="font-display text-xl font-semibold text-text-primary">
                {displayName || 'Your name'}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {user.email}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-muted">
                <Camera className="h-3.5 w-3.5" />
                Personal account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-text-primary">
              Personal information
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Update your name and profile picture.
            </p>
          </div>

          <Input
            label="Full name"
            name="displayName"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value)
              setSuccessMessage('')
              setErrorMessage('')
            }}
            placeholder="Enter your full name"
            leadingIcon={<UserRound className="h-4 w-4" />}
            autoComplete="name"
            required
            disabled={isSaving || isSigningOut}
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            value={user.email || ''}
            leadingIcon={<Mail className="h-4 w-4" />}
            disabled
            hint="Your email address is managed by Firebase Authentication and cannot be changed here."
          />

          <Input
            label="Profile photo URL"
            name="photoURL"
            type="url"
            value={photoURL}
            onChange={(event) => {
              setPhotoURL(event.target.value)
              setHasPhotoError(false)
              setSuccessMessage('')
              setErrorMessage('')
            }}
            placeholder="https://example.com/your-photo.jpg"
            leadingIcon={<Camera className="h-4 w-4" />}
            hint="Use a publicly accessible image URL. Leave it empty to remove your photo."
            disabled={isSaving || isSigningOut}
          />

          {successMessage && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSaving}
              disabled={isSigningOut}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save changes
            </Button>
          </div>
        </form>

        <div className="border-t border-border px-6 py-6 sm:px-8">
          <h3 className="font-semibold text-text-primary">
            Account
          </h3>
          <p className="mb-4 mt-1 text-sm text-text-secondary">
            Sign out of your Everleaf account on this device.
          </p>

          <Button
            type="button"
            variant="danger"
            onClick={handleSignOut}
            loading={isSigningOut}
            disabled={isSaving}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Sign out
          </Button>
        </div>
      </section>
    </main>
  )
}

export default Profile