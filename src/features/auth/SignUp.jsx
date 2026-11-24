import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { registerUser } from '../../services/authService'
import { ROUTES } from '../../routes/routeConfig'

function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use':
      'An account with this email address already exists. Try signing in instead.',
    'auth/invalid-email':
      'Please enter a valid email address.',
    'auth/weak-password':
      'Your password is too weak. Use at least 6 characters.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection and try again.',
    'auth/operation-not-allowed':
      'Email and password registration is not enabled in Firebase.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a moment and try again.',
    'auth/user-disabled':
      'This account has been disabled. Please contact support.',
    'auth/quota-exceeded':
      'The email service has reached its sending limit. Please try again later.',
    'auth/unauthorized-domain':
      'This domain is not authorized in Firebase. Please check your Firebase authorized domains.',
    'permission-denied':
      'Your account was created, but Firestore could not save its profile. Please check your Firestore security rules.',
    'auth/registration-incomplete':
      error?.message ||
      'Your account was created, but setup did not finish. Continue to email verification.',
  }

  return (
    messages[error?.code] ||
    'Something went wrong while creating your account. Please try again.'
  )
}

function SignUp() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [canContinueToVerification, setCanContinueToVerification] =
    useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setCanContinueToVerification(false)

    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).')
      return
    }

    if (!normalizedEmail) {
      setErrorMessage('Please enter your email address.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Your password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Your passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await registerUser({
        name: trimmedName,
        email: normalizedEmail,
        password,
      })

      navigate(ROUTES.VERIFY_EMAIL, { replace: true })
    } catch (error) {
      console.error('Sign-up error:', error)

      if (error?.code === 'auth/registration-incomplete' && error.user) {
        setCanContinueToVerification(true)
      }

      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
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
              Create your account
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Start your personal reading journey with Everleaf.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              leadingIcon={<UserRound className="h-4 w-4" />}
              autoComplete="name"
              required
              disabled={isSubmitting}
            />

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
              disabled={isSubmitting}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              leadingIcon={<LockKeyhole className="h-4 w-4" />}
              autoComplete="new-password"
              hint="Use at least 6 characters."
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
              disabled={isSubmitting}
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              leadingIcon={<LockKeyhole className="h-4 w-4" />}
              autoComplete="new-password"
              trailingElement={
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                  className="text-text-muted transition hover:text-text-primary"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              required
              disabled={isSubmitting}
            />

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
              >
                <p>{errorMessage}</p>

                {canContinueToVerification && (
                  <Link
                    to={ROUTES.VERIFY_EMAIL}
                    className="mt-3 block font-semibold underline underline-offset-2"
                  >
                    Continue to email verification
                  </Link>
                )}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
            >
              Create account
            </Button>
          </form>

          <div className="my-6 border-t border-border" />

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-walnut transition hover:text-primary-hover"
            >
              Sign in
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

export default SignUp