<template>
  <main class="settings-page">
    <header class="page-header">
      <p class="eyebrow">Mon espace</p>
      <h1>Réglages</h1>
    </header>

    <section class="settings-panel" aria-label="Réglages du foyer">
      <div class="setting-row">
        <span>Code du foyer</span>
        <span class="sync-badge" :class="{ connected: isConnected }">
          {{ isConnected ? 'Connecté' : 'À connecter' }}
        </span>
      </div>

      <div class="household-form">
        <label class="sr-only" for="household-code">Code du foyer</label>
        <input
          id="household-code"
          v-model.trim="code"
          type="text"
          maxlength="32"
          placeholder="Ex. Maison"
          @keydown.enter="joinHousehold"
        />
        <button class="primary-button" type="button" :disabled="!code" @click="joinHousehold">
          {{ isConnected ? 'Mettre à jour' : 'Rejoindre' }}
        </button>
      </div>
      <p class="setting-help">
        Utilise le même code sur les deux téléphones pour partager le planning.
      </p>

      <div class="setting-divider"></div>

      <div class="setting-row family-heading">
        <div>
          <span>Repas chez les proches</span>
          <p class="setting-help">Choisis chez qui tu manges pour chaque jour.</p>
        </div>
        <label class="switch-control">
          <span class="sr-only">Activer les personnes du foyer</span>
          <input v-model="familyEnabled" type="checkbox" />
          <span class="switch-track"></span>
        </label>
      </div>

      <div v-if="familyEnabled" class="family-settings">
        <div class="person-form">
          <label class="sr-only" for="person-name">Nom de la personne</label>
          <input
            id="person-name"
            v-model.trim="newPersonName"
            type="text"
            maxlength="32"
            placeholder="Prénom ou nom"
            @keydown.enter.prevent="addPerson"
          />
          <label class="color-picker">
            <span class="sr-only">Couleur de la personne</span>
            <input v-model="newPersonColor" type="color" />
          </label>
          <button
            class="secondary-button"
            type="button"
            :disabled="!newPersonName"
            @click="addPerson"
          >
            Ajouter
          </button>
        </div>
        <ul v-if="people.length" class="people-list">
          <li v-for="person in people" :key="person.id">
            <span class="person-dot" :style="{ backgroundColor: person.color }"></span>
            <span>{{ person.name }}</span>
            <label class="person-color-picker">
              <span class="sr-only">Changer la couleur de {{ person.name }}</span>
              <input v-model="person.color" type="color" />
            </label>
            <button
              class="remove-person"
              type="button"
              :aria-label="`Supprimer ${person.name}`"
              @click="removePerson(person.id)"
            >
              ×
            </button>
          </li>
        </ul>
        <p v-else class="setting-help">
          Ajoute au moins une personne pour l’utiliser dans le planning.
        </p>
      </div>

      <div class="setting-divider"></div>

      <button class="danger-button" type="button" @click="clearLocalData">
        Effacer les données locales de cet appareil
      </button>
    </section>

    <p class="sync-status" :class="{ connected: isConnected }">
      {{ statusMessage }}
    </p>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  clearHouseholdCode,
  loadFamilySettings,
  loadHouseholdCode,
  saveFamilySettings,
  saveHouseholdCode,
} from '@/stores/household'

const code = ref(loadHouseholdCode())
const isConnected = ref(Boolean(code.value))
const familySettings = ref(loadFamilySettings())
const familyEnabled = ref(familySettings.value.enabled)
const people = ref(familySettings.value.people)
const newPersonName = ref('')
const newPersonColor = ref('#efaa32')
const statusMessage = computed(() =>
  isConnected.value ? `Foyer « ${code.value} » sélectionné` : 'Aucun foyer sélectionné',
)

watch(
  [familyEnabled, people],
  () => saveFamilySettings({ enabled: familyEnabled.value, people: people.value }),
  { deep: true },
)

function joinHousehold() {
  const normalizedCode = saveHouseholdCode(code.value)
  code.value = normalizedCode
  isConnected.value = Boolean(normalizedCode)
}

function clearLocalData() {
  localStorage.removeItem('mealboard-meals')
  localStorage.removeItem('mealboard-family-settings')
  localStorage.removeItem('mealboard-day-hosts')
  clearHouseholdCode()
  code.value = ''
  isConnected.value = false
}

function addPerson() {
  if (!newPersonName.value) return
  people.value.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: newPersonName.value,
    color: newPersonColor.value,
  })
  newPersonName.value = ''
}

function removePerson(personId) {
  people.value = people.value.filter((person) => person.id !== personId)
}
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  background: #edf1e9;
  color: #182820;
  font-family: Arial, sans-serif;
  margin: 0;
}
.settings-page {
  min-height: 100vh;
  padding: 28px max(20px, calc((100vw - 980px) / 2)) 105px;
}
.page-header {
  margin-bottom: 16px;
}
.eyebrow {
  color: #ed9417;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  margin: 0 0 7px;
  text-transform: uppercase;
}
h1,
h2 {
  font-family: Georgia, serif;
  margin: 0;
}
h1 {
  font-size: clamp(32px, 5vw, 42px);
}
.settings-panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #d8dfd3;
  border-radius: 18px;
  padding: 18px 16px 8px;
}
.setting-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 6px 0 14px;
}
.setting-row > span:first-child {
  font-size: 17px;
}
.sync-badge {
  color: #b5472c;
  font:
    13px Georgia,
    serif;
}
.sync-badge.connected {
  color: #3f7157;
}
.household-form {
  display: flex;
  gap: 10px;
}
.household-form input {
  background: #fff;
  border: 1px solid #d8dfd3;
  border-radius: 14px;
  color: #182820;
  font: inherit;
  min-height: 46px;
  min-width: 0;
  padding: 0 15px;
  width: 100%;
}
.primary-button {
  background: #efaa32;
  border: 0;
  border-radius: 14px;
  color: #17251f;
  cursor: pointer;
  font-weight: 700;
  min-height: 46px;
  padding: 0 20px;
  white-space: nowrap;
}
.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.setting-help {
  color: #66766c;
  font:
    14px/1.45 Georgia,
    serif;
  margin: 9px 0 15px;
}
.setting-divider {
  border-top: 1px solid #d8dfd3;
  margin: 0 0 13px;
}
.family-heading {
  align-items: flex-start;
}
.family-heading .setting-help {
  margin: 6px 0 0;
}
.switch-control {
  cursor: pointer;
  flex: 0 0 auto;
  position: relative;
}
.switch-control input {
  height: 1px;
  opacity: 0;
  position: absolute;
  width: 1px;
}
.switch-track {
  background: #cbd5cb;
  border-radius: 999px;
  display: block;
  height: 28px;
  padding: 3px;
  transition: background 0.15s ease;
  width: 50px;
}
.switch-track::after {
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(23, 37, 31, 0.22);
  content: '';
  display: block;
  height: 22px;
  transform: translateX(0);
  transition: transform 0.15s ease;
  width: 22px;
}
.switch-control input:checked + .switch-track {
  background: #3f7157;
}
.switch-control input:checked + .switch-track::after {
  transform: translateX(22px);
}
.family-settings {
  padding-bottom: 4px;
}
.person-form {
  display: flex;
  gap: 8px;
}
.person-form input[type='text'] {
  background: #fff;
  border: 1px solid #d8dfd3;
  border-radius: 14px;
  color: #182820;
  font: inherit;
  min-height: 44px;
  min-width: 0;
  padding: 0 12px;
  width: 100%;
}
.color-picker {
  align-items: center;
  background: #fff;
  border: 1px solid #d8dfd3;
  border-radius: 14px;
  display: flex;
  flex: 0 0 48px;
  justify-content: center;
}
.color-picker input {
  border: 0;
  cursor: pointer;
  height: 28px;
  padding: 0;
  width: 28px;
}
.secondary-button {
  background: #fff;
  border: 1px solid #d8dfd3;
  border-radius: 14px;
  color: #35443b;
  cursor: pointer;
  font-weight: 700;
  min-height: 44px;
  padding: 0 15px;
  white-space: nowrap;
}
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.people-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}
.people-list li {
  align-items: center;
  border-top: 1px solid #e4e9e0;
  display: flex;
  gap: 9px;
  min-height: 44px;
}
.person-dot {
  border-radius: 50%;
  height: 14px;
  width: 14px;
}
.person-color-picker {
  align-items: center;
  cursor: pointer;
  display: flex;
  margin-left: auto;
}
.person-color-picker input {
  border: 0;
  cursor: pointer;
  height: 26px;
  padding: 0;
  width: 26px;
}
.remove-person {
  background: transparent;
  border: 0;
  color: #d7542e;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}
.danger-button {
  background: #fff;
  border: 1px solid #efcfc6;
  border-radius: 14px;
  color: #d7542e;
  cursor: pointer;
  font-weight: 700;
  min-height: 44px;
  padding: 0 15px;
  width: 100%;
}
.sync-status {
  color: #68776d;
  font:
    15px Georgia,
    serif;
  margin: 24px 0;
  text-align: center;
}
.sync-status.connected {
  color: #3f7157;
}
.sr-only {
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
}
@media (max-width: 480px) {
  .settings-page {
    padding: 22px 14px 105px;
  }
  .household-form {
    align-items: stretch;
    flex-direction: column;
  }
  .person-form {
    flex-wrap: wrap;
  }
  .person-form .secondary-button {
    flex: 1;
  }
}
</style>
