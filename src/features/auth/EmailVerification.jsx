
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Leaf,
  Mail,
  MailCheck,
  RefreshCw,
} from 'lucide-react'

import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import {
  resendVerificationEmail,
  signOutUser,
} from '../../services/authService'
import { ROUTES } from '../../routes/routeConfig'

function getVerificationErrorMessage(error) {
  const messages = {
    'auth/too-many-requests':
      'Too many requests. Please wait a little before trying again.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection.',
    'auth/user-disabled':
      'This account has been disabled. Please contact support.',
    'auth/operation-not-allowed':
      'Email verification is not currently enabled for this Firebase project.',
  }

  return (
    messages[error?.code] ||
    'We could not complete that request. Please try again.'
  )
}

function EmailVerification() {
  const navigate = useNavigate()
  const { user, loading, authError } = useAuth()

  const [isVerified, setIsVerified] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCheckingVerification, setIsCheckingVerification] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleResendEmail = async () => {
    if (!user) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    setErrorMessage('')
    setMessage('')
    setIsSending(true)

    try {
      const emailWasSent = await resendVerificationEmail(user)

      if (!emailWasSent) {
        setIsVerified(true)
        return
      }

      setMessage(
        'A new verification email has been sent. Please check your inbox and spam folder.',
      )
    } catch (error) {
      console.error('Resend verification error:', error)
      setErrorMessage(getVerificationErrorMessage(error))
    } finally {
      setIsSending(false)
    }
  }

  const handleCheckVerification = async () => {
    if (!user) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    setErrorMessage('')
    setMessage('')
    setIsCheckingVerification(true)

    try {
      // Refresh the Firebase user so emailVerified reflects the latest status.
      await user.reload()

      if (user.emailVerified) {
        setIsVerified(true)
        return
      }

      setMessage(
        'Your email is not verified yet. Open the verification email, click its link, and check again.',
      )
    } catch (error) {
      console.error('Verification status check error:', error)
      setErrorMessage(getVerificationErrorMessage(error))
    } finally {
      setIsCheckingVerification(false)
    }
  }

  const handleSignOut = async () => {
    setErrorMessage('')
    setIsSigningOut(true)

    try {
      await signOutUser()
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (error) {
      console.error('Sign-out error:', error)
      setErrorMessage(getVerificationErrorMessage(error))
    } finally {
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-background px-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-walnut" />
          <p className="text-sm text-text-secondary">
            Checking your account...
          </p>
        </div>
      </main>
    )
  }

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center" role="alert">
          <h1 className="font-display text-xl font-semibold text-text-primary">
            We couldn't verify your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Please refresh the page and try again. If the problem continues,
            sign in again.
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (user.emailVerified || isVerified) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
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

        <section className="rounded-2xl border border-border bg-surface p-6 text-center shadow-lg sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
            <Mail className="h-8 w-8 text-walnut" />
          </div>

          <h1 className="font-display text-2xl font-semibold text-text-primary">
            Verify your email
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            We've sent a verification link to the email address below. Open
            that email and click the link to verify your account.
          </p>

          <p className="mt-4 break-all rounded-lg bg-surface-secondary px-4 py-3 text-sm font-semibold text-text-primary">
            {user.email || 'Your account email'}
          </p>

          <div className="mt-6 space-y-3">
            <Button
              type="button"
              fullWidth
              size="lg"
              loading={isCheckingVerification}
              onClick={handleCheckVerification}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                I've verified my email
              </span>
            </Button>

            <Button
              type="button"
              fullWidth
              variant="outline"
              loading={isSending}
              onClick={handleResendEmail}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <MailCheck className="h-4 w-4" />
                Resend verification email
              </span>
            </Button>
          </div>

          {message && (
            <div
              role="status"
              className="mt-5 rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"
            >
              <span className="inline-flex items-start gap-2 text-left">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {message}
              </span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
            >
              {errorMessage}
            </div>
          )}

          <div className="my-6 border-t border-border" />

          <p className="text-sm text-text-secondary">
            Wrong account?{' '}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="font-semibold text-walnut transition hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          Your reading journey, thoughtfully organized.
        </p>
      </div>
    </main>
  )
}

export default EmailVerification
