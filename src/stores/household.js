const HOUSEHOLD_CODE_KEY = 'mealboard-household-code'
const FAMILY_SETTINGS_KEY = 'mealboard-family-settings'
const DAY_HOSTS_KEY = 'mealboard-day-hosts'

import { subscribeToHousehold, stopHouseholdSync, syncCurrentState } from '@/services/firebaseSync'

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

export function loadFamilySettings() {
  try {
    const settings = JSON.parse(localStorage.getItem(FAMILY_SETTINGS_KEY) || 'null')
    return {
      enabled: Boolean(settings?.enabled),
      people: Array.isArray(settings?.people) ? settings.people : [],
    }
  } catch {
    return { enabled: false, people: [] }
  }
}

export function saveFamilySettings(settings) {
  localStorage.setItem(FAMILY_SETTINGS_KEY, JSON.stringify(settings))
  syncCurrentState()
}

export function loadDayHosts() {
  try {
    const hosts = JSON.parse(localStorage.getItem(DAY_HOSTS_KEY) || '{}')
    return hosts && typeof hosts === 'object' && !Array.isArray(hosts) ? hosts : {}
  } catch {
    return {}
  }
}

export function saveDayHosts(hosts) {
  localStorage.setItem(DAY_HOSTS_KEY, JSON.stringify(hosts))
  syncCurrentState()
}
