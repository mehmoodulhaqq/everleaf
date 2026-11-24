
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyBeforeUpdateEmail,
  verifyPasswordResetCode,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { auth, db } from '../lib/firebase'

function normalizeEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Please enter a valid email address.')
  }

  return email.trim().toLowerCase()
}

function getCurrentUser() {
  const user = auth.currentUser

  if (!user) {
    throw new Error('You must be signed in to perform this action.')
  }

  return user
}

function getUserDocumentRef(uid) {
  if (!uid) {
    throw new Error('A valid user ID is required.')
  }

  return doc(db, 'users', uid)
}

function validatePhotoURL(photoURL) {
  if (photoURL === null || photoURL === '') {
    return null
  }

  if (typeof photoURL !== 'string') {
    throw new Error('Profile photo URL must be a valid URL.')
  }

  let parsedURL

  try {
    parsedURL = new URL(photoURL.trim())
  } catch {
    throw new Error('Please enter a valid profile photo URL.')
  }

  if (!['http:', 'https:'].includes(parsedURL.protocol)) {
    throw new Error('Profile photo URL must use HTTP or HTTPS.')
  }

  return parsedURL.href
}

/**
 * Create the root users/{uid} profile document if it does not exist,
 * or safely merge the latest Firebase Auth profile fields into it.
 */
async function ensureUserProfile(user, initialDisplayName = '') {
  if (!user) {
    throw new Error('A signed-in user is required to create a profile.')
  }

  const profileRef = getUserDocumentRef(user.uid)
  const profileSnapshot = await getDoc(profileRef)
  const existingProfile = profileSnapshot.exists()
    ? profileSnapshot.data()
    : {}

  const displayName =
    user.displayName?.trim() ||
    initialDisplayName.trim() ||
    existingProfile.displayName ||
    ''

  const profileData = {
    uid: user.uid,
    displayName,
    email: user.email || existingProfile.email || '',
    photoURL: user.photoURL ?? existingProfile.photoURL ?? null,
    updatedAt: serverTimestamp(),
  }

  if (!profileSnapshot.exists()) {
    profileData.createdAt = serverTimestamp()
  }

  await setDoc(profileRef, profileData, { merge: true })

  return {
    ...existingProfile,
    ...profileData,
  }
}

/**
 * Register an email/password account, create its Firestore profile,
 * and send the verification email.
 *
 * If Firebase Auth creates the account but a later setup step fails,
 * the error carries the created user so the UI can offer recovery.
 */
export async function registerUser({ name, email, password } = {}) {
  const displayName = typeof name === 'string' ? name.trim() : ''
  const normalizedEmail = normalizeEmail(email)

  if (!displayName || !normalizedEmail || !password) {
    throw new Error('Please fill in all required fields.')
  }

  if (displayName.length < 2) {
    throw new Error('Your name must contain at least 2 characters.')
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new Error('Password must contain at least 6 characters.')
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  )

  const user = userCredential.user

  try {
    await updateProfile(user, { displayName })
    await ensureUserProfile(user, displayName)
    await sendEmailVerification(user)

    return user
  } catch (cause) {
    const error = new Error(
      'Your account was created, but setup did not finish. Continue to email verification and try resending the verification email.',
    )

    error.code = 'auth/registration-incomplete'
    error.cause = cause
    error.user = user

    throw error
  }
}

/**
 * Sign in with email/password and ensure the user's profile document exists.
 */
export async function signInUser({ email, password } = {}) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password) {
    throw new Error('Please enter your email address and password.')
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  )

  const user = userCredential.user
  await ensureUserProfile(user)

  return user
}

/**
 * Sign in with Google and ensure the matching Firestore profile exists.
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  const userCredential = await signInWithPopup(auth, provider)
  const user = userCredential.user

  await ensureUserProfile(user)

  return user
}

/**
 * Sign out the current Firebase Authentication user.
 */
export async function signOutUser() {
  await signOut(auth)
}

/**
 * Reload the current user's verification state and resend the email only
 * when the same account is still signed in and remains unverified.
 */
export async function resendVerificationEmail(expectedUser = auth.currentUser) {
  if (!expectedUser) {
    throw new Error('Please sign in before requesting email verification.')
  }

  const currentUser = getCurrentUser()

  if (currentUser.uid !== expectedUser.uid) {
    throw new Error('The signed-in account has changed. Please try again.')
  }

  await currentUser.reload()

  const refreshedUser = getCurrentUser()

  if (refreshedUser.uid !== expectedUser.uid) {
    throw new Error('The signed-in account has changed. Please try again.')
  }

  if (refreshedUser.emailVerified) {
    return false
  }

  await sendEmailVerification(refreshedUser)

  return true
}

/**
 * Send a password-reset email.
 */
export async function requestPasswordReset(email) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error('Please enter your email address.')
  }

  await sendPasswordResetEmail(auth, normalizedEmail)
}

/**
 * Validate a password-reset action code and return its associated email.
 */
export async function verifyPasswordResetCodeAction(oobCode) {
  if (typeof oobCode !== 'string' || !oobCode.trim()) {
    throw new Error('The password-reset link is missing its action code.')
  }

  return verifyPasswordResetCode(auth, oobCode)
}

/**
 * Complete a password reset using the action code from Firebase's email.
 */
export async function completePasswordReset({ oobCode, newPassword } = {}) {
  if (typeof oobCode !== 'string' || !oobCode.trim()) {
    throw new Error('The password-reset link is missing its action code.')
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new Error('Your new password must contain at least 6 characters.')
  }

  await confirmPasswordReset(auth, oobCode, newPassword)
}

/**
 * Read the signed-in user's root Firestore profile document.
 * Refresh Firebase Auth first so a verified email change is reflected.
 */
export async function getUserProfile() {
  const user = getCurrentUser()

  await user.reload()

  const refreshedUser = getCurrentUser()
  const profileRef = getUserDocumentRef(refreshedUser.uid)
  const profileSnapshot = await getDoc(profileRef)

  if (!profileSnapshot.exists()) {
    return null
  }

  const profileData = profileSnapshot.data()
  const latestEmail = refreshedUser.email || ''

  // Synchronize the verified email with Firestore.
  if (profileData.email !== latestEmail) {
    await setDoc(
      profileRef,
      {
        email: latestEmail,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    profileData.email = latestEmail
  }

  return {
    id: profileSnapshot.id,
    ...profileData,
  }
}

/**
 * Update Firebase Auth and the matching root Firestore profile document.
 * Pass null or an empty string for photoURL to remove the profile photo.
 */
export async function updateUserProfile({
  displayName,
  photoURL,
} = {}) {
  const user = getCurrentUser()
  const authUpdates = {}

  if (displayName !== undefined) {
    if (typeof displayName !== 'string') {
      throw new Error('Your name must be valid text.')
    }

    const normalizedName = displayName.trim()

    if (normalizedName.length < 2) {
      throw new Error('Your name must contain at least 2 characters.')
    }

    authUpdates.displayName = normalizedName
  }

  if (photoURL !== undefined) {
    authUpdates.photoURL = validatePhotoURL(photoURL)
  }

  if (Object.keys(authUpdates).length === 0) {
    throw new Error('There are no profile changes to save.')
  }

  // Firebase Auth is updated first because it is the source of truth
  // for displayName and photoURL.
  await updateProfile(user, authUpdates)

  const profileUpdates = {
    uid: user.uid,
    email: user.email || '',
    updatedAt: serverTimestamp(),
  }

  if (authUpdates.displayName !== undefined) {
    profileUpdates.displayName = authUpdates.displayName
  }

  if (authUpdates.photoURL !== undefined) {
    profileUpdates.photoURL = authUpdates.photoURL
  }

  try {
    await setDoc(
      getUserDocumentRef(user.uid),
      profileUpdates,
      { merge: true },
    )
  } catch (cause) {
    const error = new Error(
      'Your Firebase profile changed, but Everleaf could not sync the profile document. Please try saving again.',
    )

    error.code = 'auth/profile-sync-failed'
    error.cause = cause
    throw error
  }

  return user
}

/**
 * Start a secure email-change process.
 *
 * Email/password users must provide their current password.
 * Google users must reauthenticate through Google.
 * Firebase sends a verification link to the new email address.
 * The new email becomes active only after verification.
 */
export async function requestEmailChange({
  newEmail,
  password,
} = {}) {
  const user = getCurrentUser()
  const normalizedEmail = normalizeEmail(newEmail)

  if (!normalizedEmail) {
    throw new Error('Please enter your new email address.')
  }

  if (normalizedEmail === user.email?.toLowerCase()) {
    throw new Error('Your new email is the same as your current email.')
  }

  const providers = user.providerData.map(
    (provider) => provider.providerId,
  )

  if (providers.includes('password')) {
    if (typeof password !== 'string' || !password) {
      throw new Error('Please enter your current password.')
    }

    if (!user.email) {
      throw new Error('Your account does not have a valid email address.')
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      password,
    )

    await reauthenticateWithCredential(user, credential)
  } else if (providers.includes('google.com')) {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    await reauthenticateWithPopup(user, provider)
  } else {
    throw new Error(
      'Your sign-in method does not support email changes through this process.',
    )
  }

  await verifyBeforeUpdateEmail(user, normalizedEmail)

  return true
}
