
import { useEffect, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  LogOut,
  Mail,
  Save,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

import { useAuth } from '../../context/AuthContext'
import {
  getUserProfile,
  requestEmailChange,
  signOutUser,
  updateUserProfile,
} from '../../services/authService'

import { ROUTES } from '../../routes/routeConfig'

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (!words.length) return 'U'

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function getProfileErrorMessage(error) {
  const messages = {
    'auth/wrong-password': 'Your password is incorrect.',
    'auth/invalid-credential': 'Your credentials are incorrect.',
    'auth/requires-recent-login':
      'Please sign in again before performing this action.',
    'auth/email-already-in-use':
      'This email address is already being used.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection.',
    'auth/too-many-requests':
      'Too many attempts. Please try again later.',
    'auth/user-not-found':
      'Your account could not be found.',
    'auth/popup-closed-by-user':
      'The authentication window was closed.',
    'auth/popup-blocked':
      'Your browser blocked the authentication popup.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

function Profile() {
  const navigate = useNavigate()
  const { user, authLoading } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [generalError, setGeneralError] = useState('')

  const [hasPhotoError, setHasPhotoError] = useState(false)

  // Load the profile without changing the page structure.
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    let isActive = true

    // Display Firebase Auth data immediately.
    setDisplayName(user.displayName || '')
    setPhotoURL(user.photoURL || '')
    setIsLoadingProfile(true)

    async function loadProfile() {
      try {
        const profile = await getUserProfile()

        if (!isActive) return

        setDisplayName(
          profile?.displayName || user.displayName || ''
        )

        setPhotoURL(profile?.photoURL || user.photoURL || '')
      } catch (error) {
        console.error('Profile loading error:', error)

        if (!isActive) return

        // Firebase Auth data is still available as a fallback.
        setDisplayName(user.displayName || '')
        setPhotoURL(user.photoURL || '')
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
  }, [user, authLoading, navigate])

  const currentDisplayName = displayName || user?.displayName || ''

  const currentPhotoURL = photoURL || user?.photoURL || ''

  const currentEmail = user?.email || ''

  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === 'google.com'
  )

  const isPasswordUser = user?.providerData?.some(
    (provider) => provider.providerId === 'password'
  )

  // Save name and photo.
  async function handleSaveProfile(event) {
    event.preventDefault()

    setProfileMessage('')
    setProfileError('')

    const trimmedName = displayName.trim()

    if (trimmedName.length < 2) {
      setProfileError('Name must contain at least 2 characters.')
      return
    }

    if (photoURL.trim()) {
      try {
        const parsedURL = new URL(photoURL.trim())

        if (!['http:', 'https:'].includes(parsedURL.protocol)) {
          setProfileError(
            'Profile photo must be a valid HTTP or HTTPS URL.'
          )
          return
        }
      } catch {
        setProfileError('Please enter a valid profile photo URL.')
        return
      }
    }

    setIsSavingProfile(true)

    try {
      await updateUserProfile({
        displayName: trimmedName,
        photoURL: photoURL.trim(),
      })

      setDisplayName(trimmedName)
      setPhotoURL(photoURL.trim())
      setHasPhotoError(false)

      setProfileMessage('Profile updated successfully.')
    } catch (error) {
      setProfileError(getProfileErrorMessage(error))
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Request email change.
  async function handleEmailChange(event) {
    event.preventDefault()

    setEmailMessage('')
    setEmailError('')

    const normalizedEmail = newEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      setEmailError('Please enter your new email address.')
      return
    }

    if (normalizedEmail === currentEmail.toLowerCase()) {
      setEmailError('This is already your current email address.')
      return
    }

    if (isPasswordUser && !currentPassword) {
      setEmailError('Please enter your current password.')
      return
    }

    setIsChangingEmail(true)

    try {
      await requestEmailChange({
        newEmail: normalizedEmail,
        password: currentPassword,
      })

      setEmailMessage(
        `Verification email sent to ${normalizedEmail}. ` +
        'Follow the instructions in that email to complete your change.'
      )

      setNewEmail('')
      setCurrentPassword('')
    } catch (error) {
      setEmailError(getProfileErrorMessage(error))
    } finally {
      setIsChangingEmail(false)
    }
  }

  // Sign out.
  async function handleSignOut() {
    setGeneralError('')
    setIsSigningOut(true)

    try {
      await signOutUser()
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      setGeneralError(getProfileErrorMessage(error))
      setIsSigningOut(false)
    }
  }

  // Wait for authentication initialization only.
  // No profile-loading spinner and no changing page wrapper.
  if (authLoading || !user) {
    return null
  }

  return (
    <div className="w-full min-w-0">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account."
      />

      <div className="flex w-full min-w-0 flex-col gap-6">

        {/* Profile overview */}
        <section className="w-full min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex w-full min-w-0 flex-col gap-5 sm:flex-row sm:items-center">

            {/* Avatar */}
            <div className="relative flex shrink-0 items-center justify-center">
              {currentPhotoURL && !hasPhotoError ? (
                <img
                  src={currentPhotoURL}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                  onError={() => setHasPhotoError(true)}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand text-2xl font-semibold text-walnut">
                  {getInitials(currentDisplayName)}
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-walnut text-white">
                <Camera size={13} />
              </div>
            </div>

            {/* User information */}
            <div className="min-w-0 flex-1">
              <h2 className="break-words font-display text-xl font-semibold text-text-primary">
                {currentDisplayName || 'Reader'}
              </h2>

              <p className="mt-1 break-all text-sm text-text-secondary">
                {currentEmail}
              </p>

              <p className="mt-2 text-xs text-text-muted">
                Your personal Everleaf account
              </p>
            </div>

          </div>
        </section>

        {/* Personal information */}
        <section className="w-full min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-walnut">
              <UserRound size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-text-primary">
                Personal information
              </h2>

              <p className="text-sm text-text-secondary">
                Update your name and profile photo.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="flex w-full min-w-0 flex-col gap-4"
          >
            <div className="w-full min-w-0">
              <Input
                id="displayName"
                label="Full name"
                type="text"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value)
                  setProfileMessage('')
                  setProfileError('')
                }}
                placeholder="Enter your name"
              />
            </div>

            <div className="w-full min-w-0">
              <Input
                id="photoURL"
                label="Profile photo URL"
                type="url"
                value={photoURL}
                onChange={(event) => {
                  setPhotoURL(event.target.value)
                  setHasPhotoError(false)
                  setProfileMessage('')
                  setProfileError('')
                }}
                placeholder="https://example.com/photo.jpg"
              />

              <p className="mt-1.5 text-xs text-text-muted">
                Paste a publicly accessible image URL.
              </p>
            </div>

            {profileError && (
              <p className="text-sm text-red-600">
                {profileError}
              </p>
            )}

            {profileMessage && (
              <p className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 size={16} />
                {profileMessage}
              </p>
            )}

            <div className="flex w-full justify-end">
              <Button
                type="submit"
                disabled={isSavingProfile || isLoadingProfile}
              >
                <Save size={16} />
                {isSavingProfile ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </section>

        {/* Change email */}
        <section className="w-full min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-walnut">
              <Mail size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-text-primary">
                Email address
              </h2>

              <p className="text-sm text-text-secondary">
                Change the email associated with your account.
              </p>
            </div>
          </div>

          <div className="mb-4 min-w-0 rounded-lg bg-background p-3">
            <p className="text-xs text-text-muted">
              Current email
            </p>

            <p className="mt-1 break-all text-sm font-medium text-text-primary">
              {currentEmail}
            </p>
          </div>

          <form
            onSubmit={handleEmailChange}
            className="flex w-full min-w-0 flex-col gap-4"
          >
            <div className="w-full min-w-0">
              <Input
                id="newEmail"
                label="New email address"
                type="email"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.target.value)
                  setEmailMessage('')
                  setEmailError('')
                }}
                placeholder="Enter your new email"
              />
            </div>

            {isPasswordUser && (
              <div className="w-full min-w-0">
                <Input
                  id="currentPassword"
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value)
                    setEmailError('')
                  }}
                  placeholder="Enter your current password"
                />
              </div>
            )}

            {isGoogleUser && !isPasswordUser && (
              <div className="rounded-lg bg-background p-3 text-sm text-text-secondary">
                You'll be asked to reauthenticate using your Google
                account before the email change is requested.
              </div>
            )}

            {emailError && (
              <p className="text-sm text-red-600">
                {emailError}
              </p>
            )}

            {emailMessage && (
              <div className="rounded-lg border border-border bg-background p-3 text-sm text-text-secondary">
                <div className="mb-1 flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={16} />
                  <span className="font-medium">Request submitted</span>
                </div>

                {emailMessage}
              </div>
            )}

            <div className="flex w-full justify-end">
              <Button
                type="submit"
                disabled={isChangingEmail || !newEmail.trim()}
              >
                {isChangingEmail ? 'Sending...' : 'Change email'}
              </Button>
            </div>
          </form>
        </section>

        {/* Account actions */}
        <section className="w-full min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-walnut">
              <LogOut size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-text-primary">
                Account
              </h2>

              <p className="text-sm text-text-secondary">
                Sign out of your Everleaf account.
              </p>
            </div>
          </div>

          {generalError && (
            <p className="mb-4 text-sm text-red-600">
              {generalError}
            </p>
          )}

          <div className="flex w-full justify-end">
            <Button
  type="button"
  variant="danger"
  disabled={isSigningOut}
  onClick={handleSignOut}
>
  <LogOut size={16} />
  {isSigningOut ? 'Signing out...' : 'Sign out'}
</Button>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Profile
