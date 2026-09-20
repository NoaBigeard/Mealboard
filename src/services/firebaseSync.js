import { getApp, getApps, initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBFbQnLardEPX_hrr0eItHvUPFTeKdnqh0',
  authDomain: 'mealboard-84edb.firebaseapp.com',
  databaseURL: 'https://mealboard-84edb-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'mealboard-84edb',
  storageBucket: 'mealboard-84edb.firebasestorage.app',
  messagingSenderId: '3112435712',
  appId: '1:3112435712:web:4f749c7f59a6c67b0f58e5',
  measurementId: 'G-PPLFG2EYPW',
}

const SYNC_EVENT = 'mealboard-sync'
let householdReference = null
let stopListening = null
let isWritingRemoteState = false

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || '') ?? fallback
  } catch {
    return fallback
  }
}

function readLocalState() {
  return {
    meals: readJson('mealboard-meals', {}),
    recipes: readJson('mealboard-recipes', []),
    products: readJson('mealboard-products', []),
  }
}

function applyRemoteState(state) {
  if (state.meals) localStorage.setItem('mealboard-meals', JSON.stringify(state.meals))
  if (state.recipes) localStorage.setItem('mealboard-recipes', JSON.stringify(state.recipes))
  if (state.products) localStorage.setItem('mealboard-products', JSON.stringify(state.products))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

export function subscribeToHousehold(code) {
  const normalizedCode = code.trim()
  if (!normalizedCode) return

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  const database = getDatabase(app)

  if (stopListening) stopListening()
  householdReference = ref(database, `households/${encodeURIComponent(normalizedCode)}`)
  stopListening = onValue(householdReference, async (snapshot) => {
    const remoteState = snapshot.val()
    if (remoteState) {
      isWritingRemoteState = true
      applyRemoteState(remoteState)
      isWritingRemoteState = false
      return
    }
    await syncCurrentState()
  })
}

export async function syncCurrentState() {
  if (!householdReference || isWritingRemoteState) return
  await set(householdReference, readLocalState())
}

export function onSync(callback) {
  window.addEventListener(SYNC_EVENT, callback)
  return () => window.removeEventListener(SYNC_EVENT, callback)
}

export function stopHouseholdSync() {
  if (stopListening) stopListening()
  stopListening = null
  householdReference = null
}
