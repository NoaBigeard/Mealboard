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
import { computed, ref } from 'vue'
import { clearHouseholdCode, loadHouseholdCode, saveHouseholdCode } from '@/stores/household'

const code = ref(loadHouseholdCode())
const isConnected = ref(Boolean(code.value))
const statusMessage = computed(() =>
  isConnected.value ? `Foyer « ${code.value} » sélectionné` : 'Aucun foyer sélectionné',
)

function joinHousehold() {
  const normalizedCode = saveHouseholdCode(code.value)
  code.value = normalizedCode
  isConnected.value = Boolean(normalizedCode)
}

function clearLocalData() {
  localStorage.removeItem('mealboard-meals')
  clearHouseholdCode()
  code.value = ''
  isConnected.value = false
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
}
</style>
