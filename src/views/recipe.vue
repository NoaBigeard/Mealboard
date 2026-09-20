<template>
  <main class="recipes-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Mon carnet</p>
        <h1>Recettes</h1>
      </div>
      <button class="primary-button" type="button" @click="openForm">+ Nouvelle recette</button>
    </header>

    <label class="search-field">
      <span class="sr-only">Rechercher une recette</span>
      <input v-model="search" type="search" placeholder="Rechercher une recette…" />
    </label>

    <section class="recipe-grid" aria-label="Mes recettes">
      <article
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="recipe-card"
        role="button"
        tabindex="0"
        @click="openEditForm(recipe)"
        @keydown.enter.prevent="openEditForm(recipe)"
        @keydown.space.prevent="openEditForm(recipe)"
      >
        <h2>{{ recipe.name }}</h2>
        <p class="recipe-meta">
          {{ recipe.ingredients.length || 0 }} ingr. · {{ recipe.servings }} pers.
        </p>
      </article>
    </section>

    <p v-if="!filteredRecipes.length" class="empty-state">
      Aucune recette ne correspond à cette recherche.
    </p>

    <div v-if="isFormOpen" class="modal-backdrop" @click.self="closeForm">
      <section
        class="recipe-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-form-title"
      >
        <button class="close-button" type="button" aria-label="Fermer" @click="closeForm">×</button>
        <p class="eyebrow">{{ editingRecipeId ? 'Modifier la recette' : 'Nouvelle recette' }}</p>
        <h2 id="recipe-form-title">
          {{ editingRecipeId ? 'Modifier la recette' : 'Ajouter une recette' }}
        </h2>

        <form @submit.prevent="saveRecipe">
          <div class="import-row">
            <label class="form-field import-field">
              <span>Importer depuis un lien</span>
              <input
                v-model.trim="form.sourceUrl"
                type="url"
                placeholder="https://www.marmiton.org/..."
              />
            </label>
            <button
              class="secondary-button import-button"
              :disabled="isImporting || !form.sourceUrl"
              type="button"
              @click="importRecipe"
            >
              {{ isImporting ? 'Import en cours…' : 'Importer' }}
            </button>
          </div>
          <p
            v-if="importMessage"
            class="form-message"
            :class="{ error: importError }"
            role="status"
          >
            {{ importMessage }}
          </p>
          <label class="form-field">
            <span>Nom</span>
            <input
              v-model.trim="form.name"
              required
              type="text"
              placeholder="Ex. Gratin dauphinois"
            />
          </label>
          <div class="form-row">
            <label class="form-field servings-field">
              <span>Portions de base</span>
              <input v-model.number="form.servings" min="1" required type="number" />
            </label>
          </div>

          <fieldset class="ingredients-fieldset">
            <legend>Ingrédients</legend>
            <div
              v-for="(ingredient, index) in form.ingredients"
              :key="index"
              class="ingredient-row"
            >
              <input
                v-model.trim="form.ingredients[index]"
                type="text"
                placeholder="Ex. Pommes de terre"
              />
              <button
                type="button"
                aria-label="Supprimer l'ingrédient"
                @click="removeIngredient(index)"
              >
                ×
              </button>
            </div>
            <button class="add-ingredient" type="button" @click="addIngredient">
              + Ajouter un ingrédient
            </button>
          </fieldset>

          <fieldset class="steps-fieldset">
            <legend>Étapes</legend>
            <div v-for="(step, index) in form.steps" :key="index" class="step-row">
              <span class="step-number">{{ index + 1 }}</span>
              <textarea
                :ref="(element) => setStepElement(element, index)"
                v-model.trim="form.steps[index]"
                rows="2"
                placeholder="Ex. Mélanger les ingrédients…"
                @input="resizeStep"
              ></textarea>
              <button type="button" aria-label="Supprimer l'étape" @click="removeStep(index)">
                ×
              </button>
            </div>
            <button class="add-ingredient" type="button" @click="addStep">
              + Ajouter une étape
            </button>
          </fieldset>

          <div class="form-actions">
            <button
              v-if="editingRecipeId"
              class="delete-button"
              type="button"
              @click="requestDelete"
            >
              Supprimer
            </button>
            <button class="secondary-button" type="button" @click="closeForm">Annuler</button>
            <button class="primary-button" type="submit">Enregistrer</button>
          </div>
        </form>
      </section>

      <div v-if="isDeleteDialogOpen" class="confirmation-backdrop" @click.self="closeDeleteDialog">
        <section
          class="confirmation-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          aria-describedby="delete-description"
        >
          <p class="eyebrow">Suppression définitive</p>
          <h2 id="delete-title">Supprimer cette recette ?</h2>
          <p id="delete-description">
            La recette « {{ form.name }} » sera retirée de votre carnet et du planning.
          </p>
          <div class="confirmation-actions">
            <button class="secondary-button" type="button" @click="closeDeleteDialog">
              Annuler
            </button>
            <button class="confirm-delete-button" type="button" @click="confirmDelete">
              Supprimer
            </button>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import {
  loadRecipes,
  removeRecipeFromMeals,
  saveRecipes,
  updateRecipeInMeals,
} from '@/stores/recipes'

const recipes = ref(loadRecipes())
const search = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isImporting = ref(false)
const importMessage = ref('')
const importError = ref(false)
const editingRecipeId = ref(null)
const form = reactive(createEmptyRecipe())
const stepElements = []

const filteredRecipes = computed(() => {
  const query = search.value.toLocaleLowerCase()
  return recipes.value.filter((recipe) => recipe.name.toLocaleLowerCase().includes(query))
})

function createEmptyRecipe() {
  return { name: '', servings: 4, ingredients: [''], steps: [], sourceUrl: '' }
}

function openForm() {
  Object.assign(form, createEmptyRecipe())
  editingRecipeId.value = null
  clearImportMessage()
  stepElements.length = 0
  isFormOpen.value = true
}

function openEditForm(recipe) {
  Object.assign(form, {
    name: recipe.name,
    servings: recipe.servings,
    ingredients: [...recipe.ingredients],
    steps: [...(recipe.steps || [])],
    sourceUrl: recipe.sourceUrl || '',
  })
  editingRecipeId.value = recipe.id
  clearImportMessage()
  isFormOpen.value = true
  nextTick(resizeSteps)
}

function closeForm() {
  isFormOpen.value = false
  isDeleteDialogOpen.value = false
  editingRecipeId.value = null
}

function addIngredient() {
  form.ingredients.push('')
}

function removeIngredient(index) {
  form.ingredients.splice(index, 1)
}

function addStep() {
  form.steps.push('')
  nextTick(resizeSteps)
}

function removeStep(index) {
  form.steps.splice(index, 1)
  nextTick(resizeSteps)
}

function setStepElement(element, index) {
  if (element) stepElements[index] = element
}

function resizeStep(event) {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

function resizeSteps() {
  stepElements.forEach((textarea) => {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  })
}

function clearImportMessage() {
  importMessage.value = ''
  importError.value = false
}

async function importRecipe() {
  if (!form.sourceUrl || isImporting.value) return

  isImporting.value = true
  clearImportMessage()

  try {
    const apiUrl = new URL('https://api.microlink.io')
    apiUrl.searchParams.set('url', form.sourceUrl)
    apiUrl.searchParams.set('data.recipe.selector', 'script[type="application/ld+json"]')
    apiUrl.searchParams.set('data.recipe.type', 'text')
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error('Import impossible')

    const payload = await response.json()
    const recipeData = findRecipeData(payload.data?.recipe?.value || payload.data?.recipe)
    if (!recipeData) throw new Error('Recette introuvable')

    form.servings = parseServings(recipeData.recipeYield) || form.servings
    form.ingredients = normalizeList(recipeData.recipeIngredient)
    form.steps = normalizeInstructions(recipeData.recipeInstructions)
    await nextTick()
    resizeSteps()
    importMessage.value = 'Recette importée. Vérifie les informations avant d’enregistrer.'
  } catch {
    importError.value = true
    importMessage.value =
      'Impossible de lire cette recette. Tu peux compléter le formulaire manuellement.'
  } finally {
    isImporting.value = false
  }
}

function findRecipeData(value) {
  let parsed = value
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return null
    }
  }
  const candidates = Array.isArray(parsed) ? parsed : parsed?.['@graph'] || [parsed]
  return (
    candidates.find((item) => {
      const types = Array.isArray(item?.['@type']) ? item['@type'] : [item?.['@type']]
      return types.includes('Recipe')
    }) || null
  )
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : value ? [String(value)] : []
}

function normalizeInstructions(value) {
  if (!Array.isArray(value)) return value ? [String(value)] : []
  return value
    .flatMap((step) => {
      if (typeof step === 'string') return [step]
      if (step?.['@type'] === 'HowToSection') return normalizeInstructions(step.itemListElement)
      return step?.text ? [step.text] : []
    })
    .map((step) => step.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
}

function parseServings(value) {
  const match = String(value || '').match(/\d+/)
  return match ? Number(match[0]) : null
}

function saveRecipe() {
  const recipe = {
    id:
      editingRecipeId.value ||
      `${Date.now()}-${form.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: form.name,
    servings: form.servings,
    ingredients: form.ingredients.filter(Boolean),
    steps: form.steps.filter(Boolean),
    sourceUrl: form.sourceUrl,
  }
  recipes.value = editingRecipeId.value
    ? recipes.value.map((item) => (item.id === editingRecipeId.value ? recipe : item))
    : [recipe, ...recipes.value]
  saveRecipes(recipes.value)
  if (editingRecipeId.value) updateRecipeInMeals(recipe)
  closeForm()
}

function requestDelete() {
  if (editingRecipeId.value) isDeleteDialogOpen.value = true
}

function closeDeleteDialog() {
  isDeleteDialogOpen.value = false
}

function confirmDelete() {
  if (!editingRecipeId.value) return
  recipes.value = recipes.value.filter((recipe) => recipe.id !== editingRecipeId.value)
  saveRecipes(recipes.value)
  removeRecipeFromMeals(editingRecipeId.value)
  closeForm()
}
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  background: #f1f4ed;
  color: #17251f;
  font-family: Arial, sans-serif;
}
.recipes-page {
  min-height: calc(100vh - 76px);
  padding: 28px max(20px, calc((100vw - 980px) / 2)) 110px;
}
.page-header {
  align-items: center;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 16px;
}
.eyebrow,
.recipe-category {
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
.primary-button,
.secondary-button,
.add-ingredient {
  border: 0;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  min-height: 44px;
  padding: 0 20px;
}
.primary-button {
  background: #efaa32;
  color: #17251f;
}
.secondary-button,
.add-ingredient {
  background: #fff;
  border: 1px solid #d8dfd3;
  color: #35443b;
}
.delete-button {
  background: #fff;
  border: 1px solid #efcfc6;
  border-radius: 14px;
  color: #d7542e;
  cursor: pointer;
  font-weight: 700;
  min-height: 44px;
  padding: 0 20px;
}
.search-field input,
.form-field input,
.form-field select,
.ingredient-row input,
.step-row textarea {
  border: 1px solid #d8dfd3;
  border-radius: 15px;
  background: #fff;
  color: #17251f;
  font: inherit;
  min-height: 50px;
  padding: 0 15px;
  width: 100%;
}
.step-row textarea {
  font-family: inherit;
  line-height: 1.4;
  padding-bottom: 12px;
  padding-top: 12px;
  overflow: hidden;
  resize: none;
}
.import-row {
  align-items: flex-end;
  display: flex;
  gap: 10px;
}
.import-field {
  margin-bottom: 0;
}
.import-button {
  flex: 0 0 auto;
  margin-bottom: 17px;
}
.import-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.form-message {
  color: #3f7157;
  font-size: 13px;
  margin: -5px 0 17px;
}
.form-message.error {
  color: #b5472c;
}
.search-field input {
  font-size: 17px;
  margin-bottom: 18px;
}
.recipe-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.recipe-card {
  background: #fff;
  border: 1px solid #d8dfd3;
  border-radius: 17px;
  cursor: pointer;
  min-height: 100px;
  padding: 16px 15px;
  text-align: left;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
  width: 100%;
}
.recipe-card:hover {
  border-color: #efaa32;
  transform: translateY(-1px);
}
.recipe-card:focus-visible {
  outline: 2px solid #294d41;
  outline-offset: 3px;
}
.recipe-card h2 {
  font-size: 21px;
  margin-bottom: 8px;
}
.recipe-meta {
  color: #53665a;
  font-family: Georgia, serif;
  margin: 0;
}
.empty-state {
  color: #68776d;
  padding: 24px 0;
  text-align: center;
}
.modal-backdrop {
  align-items: flex-end;
  background: rgba(23, 37, 31, 0.38);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 20;
}
.recipe-modal {
  background: #f1f4ed;
  border-radius: 24px 24px 0 0;
  max-height: 92vh;
  max-width: 680px;
  overflow-y: auto;
  padding: 28px 24px 24px;
  position: relative;
  width: 100%;
}
.confirmation-backdrop {
  align-items: center;
  background: rgba(23, 37, 31, 0.34);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 2;
}
.confirmation-dialog {
  background: #fff;
  border: 1px solid #d8dfd3;
  border-radius: 20px;
  box-shadow: 0 18px 50px rgba(23, 37, 31, 0.18);
  max-width: 410px;
  padding: 24px;
  width: 100%;
}
.confirmation-dialog h2 {
  font-size: 26px;
  margin-bottom: 10px;
}
.confirmation-dialog > p:not(.eyebrow) {
  color: #68776d;
  line-height: 1.5;
  margin: 0;
}
.confirmation-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}
.confirm-delete-button {
  background: #d7542e;
  border: 0;
  border-radius: 14px;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  min-height: 44px;
  padding: 0 20px;
}
.recipe-modal h2 {
  font-size: 28px;
  margin-bottom: 22px;
}
.close-button {
  background: transparent;
  border: 0;
  color: #53665a;
  cursor: pointer;
  font-size: 28px;
  line-height: 1;
  position: absolute;
  right: 18px;
  top: 17px;
}
.form-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 17px;
}
.form-field span,
.ingredients-fieldset legend {
  color: #68776d;
  font-size: 14px;
  font-weight: 700;
}
.form-row {
  display: flex;
  gap: 12px;
}
.servings-field {
  max-width: 140px;
}
.ingredients-fieldset {
  border: 0;
  margin: 0 0 20px;
  padding: 0;
}
.ingredients-fieldset legend {
  margin-bottom: 9px;
}
.steps-fieldset {
  border: 0;
  margin: 0 0 20px;
  padding: 0;
}
.steps-fieldset legend {
  color: #68776d;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 9px;
}
.step-row {
  align-items: flex-start;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.step-number {
  align-items: center;
  background: #e5ece2;
  border-radius: 50%;
  color: #294d41;
  display: flex;
  flex: 0 0 28px;
  font-size: 13px;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  margin-top: 11px;
}
.step-row button {
  background: transparent;
  border: 0;
  color: #d7542e;
  cursor: pointer;
  font-size: 20px;
  margin-top: 8px;
}
.ingredient-row {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.ingredient-row button {
  background: transparent;
  border: 0;
  color: #d7542e;
  cursor: pointer;
  font-size: 20px;
}
.add-ingredient {
  margin-top: 4px;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.form-actions .primary-button {
  min-width: 150px;
}
.sr-only {
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
}
@media (max-width: 560px) {
  .recipes-page {
    padding: 22px 14px 110px;
  }
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .primary-button {
    align-self: stretch;
  }
  .import-row {
    align-items: stretch;
    flex-direction: column;
    gap: 0;
  }
  .import-button {
    margin-bottom: 17px;
  }
}
@media (max-width: 400px) {
  .recipe-grid {
    grid-template-columns: 1fr;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  .servings-field {
    max-width: none;
  }
}
</style>
