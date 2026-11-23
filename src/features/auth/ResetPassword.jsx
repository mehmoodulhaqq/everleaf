
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
} from 'lucide-react'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import {
  completePasswordReset,
  verifyPasswordResetCodeAction,
} from '../../services/authService'
import { ROUTES } from '../../routes/routeConfig'

function getResetErrorMessage(error) {
  const messages = {
    'auth/expired-action-code':
      'This password reset link has expired. Please request a new one.',
    'auth/invalid-action-code':
      'This password reset link is invalid or has already been used.',
    'auth/weak-password':
      'Your password is too weak. Use at least 6 characters.',
    'auth/user-disabled':
      'This account has been disabled. Please contact support.',
    'auth/user-not-found':
      'The account associated with this link could not be found.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a moment and try again.',
  }

  return (
    messages[error?.code] ||
    'Something went wrong. Please request a new password reset link.'
  )
}

function ResetPassword() {
  const [searchParams] = useSearchParams()

  const actionCode = searchParams.get('oobCode')
  const mode = searchParams.get('mode')

  const [isVerifying, setIsVerifying] = useState(true)
  const [isCodeValid, setIsCodeValid] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    const verifyCode = async () => {
      if (mode !== 'resetPassword' || !actionCode) {
        if (isActive) {
          setErrorMessage(
            'This password reset link is incomplete or invalid. Please request a new one.',
          )
          setIsCodeValid(false)
          setIsVerifying(false)
        }
        return
      }

      try {
        const verifiedEmail =
          await verifyPasswordResetCodeAction(actionCode)

        if (isActive) {
          setEmail(verifiedEmail)
          setIsCodeValid(true)
          setErrorMessage('')
        }
      } catch (error) {
        console.error('Reset code verification error:', error)

        if (isActive) {
          setErrorMessage(getResetErrorMessage(error))
          setIsCodeValid(false)
        }
      } finally {
        if (isActive) {
          setIsVerifying(false)
        }
      }
    }

    verifyCode()

    return () => {
      isActive = false
    }
  }, [actionCode, mode])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!isCodeValid || !actionCode) {
      setErrorMessage(
        'This password reset link is no longer valid. Please request a new one.',
      )
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
      await completePasswordReset({
        oobCode: actionCode,
        newPassword: password,
      })

      setIsSuccessful(true)
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Password update error:', error)
      setErrorMessage(getResetErrorMessage(error))
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
          {isVerifying ? (
            <div className="py-10 text-center" role="status" aria-live="polite">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-walnut" />

              <h1 className="font-display text-xl font-semibold text-text-primary">
                Verifying your link
              </h1>

              <p className="mt-2 text-sm text-text-secondary">
                Please wait while we check your password reset link.
              </p>
            </div>
          ) : isSuccessful ? (
            <div className="py-6 text-center" aria-live="polite">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>

              <h1 className="font-display text-2xl font-semibold text-text-primary">
                Password updated!
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Your password has been changed successfully. You can now sign
                in using your new password.
              </p>

              <div className="mt-7">
                <Link to={ROUTES.LOGIN}>
                  <Button fullWidth>
                    Continue to sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : isCodeValid ? (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary">
                  <BookOpen className="h-6 w-6 text-walnut" />
                </div>

                <h1 className="font-display text-2xl font-semibold text-text-primary">
                  Create a new password
                </h1>

                <p className="mt-2 text-sm text-text-secondary">
                  Choose a new password for your Everleaf account.
                </p>

                <p className="mt-3 break-all text-sm font-medium text-text-primary">
                  {email}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="New password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your new password"
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
                  label="Confirm new password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your new password again"
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
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                >
                  Update password
                </Button>
              </form>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <LockKeyhole className="h-8 w-8 text-walnut" />
              </div>

              <h1 className="font-display text-2xl font-semibold text-text-primary">
                Reset link unavailable
              </h1>

              <p
                role="alert"
                className="mt-3 text-sm leading-relaxed text-danger"
              >
                {errorMessage}
              </p>

              <div className="mt-7">
                <Link to={ROUTES.FORGOT_PASSWORD}>
                  <Button fullWidth>
                    Request a new reset link
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-text-muted">
          Your reading journey, thoughtfully organized.
        </p>
      </div>
    </main>
  )
}

export default ResetPassword
