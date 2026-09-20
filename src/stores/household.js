const HOUSEHOLD_CODE_KEY = 'mealboard-household-code'

import { subscribeToHousehold, stopHouseholdSync } from '@/services/firebaseSync'

export function loadHouseholdCode() {
  return localStorage.getItem(HOUSEHOLD_CODE_KEY) || ''
}

export function saveHouseholdCode(code) {
  const normalizedCode = code.trim()
  localStorage.setItem(HOUSEHOLD_CODE_KEY, normalizedCode)
  if (normalizedCode) subscribeToHousehold(normalizedCode)
  return normalizedCode
}

export function clearHouseholdCode() {
  localStorage.removeItem(HOUSEHOLD_CODE_KEY)
  stopHouseholdSync()
}
