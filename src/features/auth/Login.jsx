
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
} from 'lucide-react'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { signInUser, signInWithGoogle } from '../../services/authService'
import { ROUTES } from '../../routes/routeConfig'

function getAuthErrorMessage(error) {
  const messages = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/user-not-found': 'No account was found with this email address.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled in Firebase.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked':
      'Your browser blocked the Google sign-in popup. Allow popups and try again.',
    'auth/unauthorized-domain':
      'This domain is not authorized for Google sign-in in Firebase.',
    'permission-denied':
      'Sign-in succeeded, but Everleaf could not access your account profile. Please check your Firestore security rules.',
  }

  return (
    messages[error?.code] ||
    'Something went wrong while signing in. Please try again.'
  )
}

function getSafeRedirectDestination(from) {
  if (!from?.pathname) {
    return ROUTES.DASHBOARD
  }

  const authenticationPaths = [
    ROUTES.LOGIN,
    ROUTES.SIGN_UP,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
  ]

  if (authenticationPaths.includes(from.pathname)) {
    return ROUTES.DASHBOARD
  }

  return {
    pathname: from.pathname,
    search: from.search || '',
    hash: from.hash || '',
  }
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isBusy = isSubmitting || isGoogleLoading

  const handleSuccessfulSignIn = (user) => {
    if (!user.emailVerified) {
      navigate(ROUTES.VERIFY_EMAIL, { replace: true })
      return
    }

    const destination = getSafeRedirectDestination(
      location.state?.from,
    )

    navigate(destination, { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setErrorMessage('Please enter your email address and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const user = await signInUser({
        email: normalizedEmail,
        password,
      })

      handleSuccessfulSignIn(user)
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMessage('')
    setIsGoogleLoading(true)

    try {
      const user = await signInWithGoogle()
      handleSuccessfulSignIn(user)
    } catch (error) {
      console.error('Google login error:', error)
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to={ROUTES.EXPLORE}
            className="mb-5 inline-flex items-center gap-2"
            aria-label="Everleaf home"
          >
            <Leaf className="h-8 w-8 text-caramel" />
            <span className="font-display text-3xl font-semibold tracking-tight text-espresso">
              everleaf
            </span>
          </Link>

          <p className="text-sm text-text-secondary">
            A little growth with every page.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary">
              <BookOpen className="h-6 w-6 text-walnut" />
            </div>

            <h1 className="font-display text-2xl font-semibold text-text-primary">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Sign in to continue your reading journey.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.74 7.18l7.73 6C44.43 37.92 46.98 31.75 46.98 24.55Z" />
              <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>

            {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              leadingIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
              disabled={isBusy}
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                leadingIcon={<LockKeyhole className="h-4 w-4" />}
                autoComplete="current-password"
                trailingElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-text-muted transition hover:text-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                required
                disabled={isBusy}
              />

              <div className="mt-2 flex justify-end">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-sm font-medium text-walnut transition hover:text-primary-hover"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
              >
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              disabled={isGoogleLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="my-6 border-t border-border" />

          <p className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link
              to={ROUTES.SIGN_UP}
              className="font-semibold text-walnut transition hover:text-primary-hover"
            >
              Create account
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          Your reading journey, thoughtfully organized.
        </p>
      </div>
    </main>
  )
}

export default Login
