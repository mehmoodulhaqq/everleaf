
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { auth, db } from '../lib/firebase'

// These are the user-owned collections currently approved by the Everleaf
// Firestore data model and the published Firestore Security Rules.
export const USER_COLLECTIONS = Object.freeze({
  BOOKS: 'books',
  READING_SESSIONS: 'readingSessions',
  GOALS: 'goals',
  WISHLIST: 'wishlist',
})

function getCurrentUserId() {
  const uid = auth.currentUser?.uid

  if (!uid) {
    throw new Error('You must be signed in to access your Everleaf data.')
  }

  return uid
}

function validateCollectionName(collectionName) {
  if (!Object.values(USER_COLLECTIONS).includes(collectionName)) {
    throw new Error(
      `Unsupported user collection: ${collectionName}. Use one of the approved Everleaf collections.`,
    )
  }
}

function validateDocumentId(documentId) {
  if (
    typeof documentId !== 'string' ||
    !documentId.trim() ||
    documentId.includes('/')
  ) {
    throw new Error('A valid Firestore document ID is required.')
  }

  return documentId.trim()
}

function getUserCollectionRef(collectionName) {
  validateCollectionName(collectionName)

  const uid = getCurrentUserId()

  return collection(db, 'users', uid, collectionName)
}

function getUserDocumentRef(collectionName, documentId) {
  const collectionRef = getUserCollectionRef(collectionName)
  const validDocumentId = validateDocumentId(documentId)

  return doc(collectionRef, validDocumentId)
}

function getPreferencesDocumentRef() {
  const uid = getCurrentUserId()

  return doc(db, 'users', uid, 'preferences', 'main')
}

function validateRecordData(data) {
  if (
    data === null ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw new Error('Firestore data must be a plain object.')
  }

  return data
}

/**
 * Create a record in the signed-in user's approved collection.
 *
 * Pass an existing record ID in data.id or provide documentId.
 * If neither is supplied, Firestore generates a document ID.
 * The returned value is the saved record, including its document ID.
 */
export async function createUserDocument(
  collectionName,
  data,
  documentId,
) {
  const record = validateRecordData(data)
  const collectionRef = getUserCollectionRef(collectionName)
  const requestedId = documentId ?? record.id

  const documentRef = requestedId
    ? doc(collectionRef, validateDocumentId(requestedId))
    : doc(collectionRef)

  const recordData = {
    ...record,
    id: documentRef.id,
    createdAt: record.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(documentRef, recordData)

  return {
    ...recordData,
    id: documentRef.id,
  }
}

/**
 * Read one record from the signed-in user's collection.
 * Returns null when the document does not exist.
 */
export async function getUserDocument(collectionName, documentId) {
  const documentRef = getUserDocumentRef(collectionName, documentId)
  const documentSnapshot = await getDoc(documentRef)

  if (!documentSnapshot.exists()) {
    return null
  }

  return {
    ...documentSnapshot.data(),
    id: documentSnapshot.id,
  }
}

/**
 * Read all records from one approved user collection.
 *
 * Optional Firestore query constraints can be supplied as an array,
 * for example where(), orderBy(), or limit() constraints.
 */
export async function getUserDocuments(
  collectionName,
  queryConstraints = [],
) {
  if (!Array.isArray(queryConstraints)) {
    throw new Error('Query constraints must be provided as an array.')
  }

  const collectionRef = getUserCollectionRef(collectionName)
  const userQuery =
    queryConstraints.length > 0
      ? query(collectionRef, ...queryConstraints)
      : collectionRef

  const querySnapshot = await getDocs(userQuery)

  return querySnapshot.docs.map((documentSnapshot) => ({
    ...documentSnapshot.data(),
    id: documentSnapshot.id,
  }))
}

/**
 * Update an existing record in the signed-in user's collection.
 * The document ID and original creation timestamp cannot be changed here.
 */
export async function updateUserDocument(
  collectionName,
  documentId,
  changes,
) {
  const updates = validateRecordData(changes)
  const validDocumentId = validateDocumentId(documentId)

  if (updates.id !== undefined && updates.id !== validDocumentId) {
    throw new Error('A record ID cannot be changed during an update.')
  }

  const safeUpdates = { ...updates }
  delete safeUpdates.id
  delete safeUpdates.createdAt

  if (Object.keys(safeUpdates).length === 0) {
    throw new Error('There are no valid changes to save.')
  }

  const documentRef = getUserDocumentRef(
    collectionName,
    validDocumentId,
  )

  await updateDoc(documentRef, {
    ...safeUpdates,
    updatedAt: serverTimestamp(),
  })

  return getUserDocument(collectionName, validDocumentId)
}

/**
 * Delete one record from the signed-in user's collection.
 */
export async function deleteUserDocument(collectionName, documentId) {
  const documentRef = getUserDocumentRef(collectionName, documentId)

  await deleteDoc(documentRef)
}

/**
 * Read the signed-in user's preferences document.
 * Returns null if preferences have not been saved yet.
 */
export async function getUserPreferences() {
  const preferencesRef = getPreferencesDocumentRef()
  const preferencesSnapshot = await getDoc(preferencesRef)

  if (!preferencesSnapshot.exists()) {
    return null
  }

  return preferencesSnapshot.data()
}

/**
 * Create or merge the signed-in user's preferences.
 */
export async function saveUserPreferences(preferences) {
  const preferenceData = validateRecordData(preferences)
  const preferencesRef = getPreferencesDocumentRef()

  await setDoc(
    preferencesRef,
    {
      ...preferenceData,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  const savedPreferences = await getDoc(preferencesRef)

  return savedPreferences.data()
}
