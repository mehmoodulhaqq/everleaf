
import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check'

// Read Firebase configuration from the local environment.
const env = import.meta.env

const requiredEnvironmentVariables = {
  VITE_FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: env.VITE_FIREBASE_APP_ID,
  VITE_RECAPTCHA_ENTERPRISE_SITE_KEY:
    env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY,
}

// Fail early with a useful message if the local .env file is incomplete.
const missingEnvironmentVariables = Object.entries(
  requiredEnvironmentVariables,
)
  .filter(([, value]) => !value?.trim())
  .map(([name]) => name)

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingEnvironmentVariables.join(', ')}. Check your root .env file and restart the Vite development server.`,
  )
}

const firebaseConfig = {
  apiKey: requiredEnvironmentVariables.VITE_FIREBASE_API_KEY,
  authDomain: requiredEnvironmentVariables.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvironmentVariables.VITE_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnvironmentVariables.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    requiredEnvironmentVariables.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnvironmentVariables.VITE_FIREBASE_APP_ID,
}

// Reuse the default Firebase app if it already exists.
const app =
  getApps().find((existingApp) => existingApp.name === '[DEFAULT]') ??
  initializeApp(firebaseConfig)

// Enable the App Check debug provider in local development.
// Firebase will print a debug token in the browser console on first use.
// Register that token in Firebase Console; never commit or share it.
if (import.meta.env.DEV && typeof self !== 'undefined') {
  if (!self.FIREBASE_APPCHECK_DEBUG_TOKEN) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }
}

// App Check must be initialized before Firebase services are used.
// Vite HMR data prevents a second initialization during hot module replacement.
const hot = import.meta.hot
const existingAppCheck = hot?.data?.appCheck

export const appCheck =
  existingAppCheck ??
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      requiredEnvironmentVariables.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY,
    ),
    isTokenAutoRefreshEnabled: true,
  })

if (hot) {
  hot.dispose((data) => {
    data.appCheck = appCheck
  })
}

// Export the shared Firebase services for the rest of the application.
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
