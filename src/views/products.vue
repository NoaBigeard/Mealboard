<template>
  <main class="products-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Mon catalogue</p>
        <h1>Produits</h1>
        <p class="page-description">
          Catalogue fixe de référence pour les féculents, protéines et légumes.
        </p>
      </div>
      <button class="primary-button" type="button" @click="openCreateForm">
        + Nouvel ingrédient
      </button>
    </header>

    <nav class="category-tabs" aria-label="Filtrer les produits">
      <button
        v-for="category in filters"
        :key="category.key"
        type="button"
        :class="{ active: selectedCategory === category.key }"
        @click="selectedCategory = category.key"
      >
        {{ category.label }}
      </button>
    </nav>

    <label class="search-field">
      <span class="sr-only">Rechercher un produit</span>
      <input v-model="search" type="search" placeholder="Rechercher un produit…" />
    </label>

    <section class="products-panel" aria-label="Liste des produits">
      <div class="panel-heading">
        <h2>
          {{ selectedCategory === 'all' ? 'Tous les produits' : categoryLabel(selectedCategory) }}
        </h2>
        <span>{{ filteredProducts.length }} éléments</span>
      </div>
      <div class="product-list">
        <button
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-row"
          type="button"
          @click="openEditForm(product)"
        >
          <strong>{{ product.name }}</strong>
          <span>{{ categoryLabel(product.category) }}</span>
          <span class="row-arrow" aria-hidden="true"></span>
        </button>
      </div>
      <p v-if="!filteredProducts.length" class="empty-state">Aucun produit trouvé.</p>
    </section>

    <div v-if="isFormOpen" class="modal-backdrop" @click.self="closeForm">
      <section
        class="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <button class="close-button" type="button" aria-label="Fermer" @click="closeForm">×</button>
        <p class="eyebrow">{{ editingProductId ? 'Modifier l’article' : 'Nouveau produit' }}</p>
        <h2 id="product-form-title">
          {{ editingProductId ? 'Modifier l’article' : 'Ajouter un produit' }}
        </h2>

        <form @submit.prevent="saveProduct">
          <label class="form-field">
            <span>Nom</span>
            <input v-model.trim="form.name" required type="text" placeholder="Ex. Aubergine" />
          </label>
          <label class="form-field select-field">
            <span>Catégorie</span>
            <select v-model="form.category">
              <option
                v-for="category in productCategories"
                :key="category.key"
                :value="category.key"
              >
                {{ category.label }}
              </option>
            </select>
          </label>
          <div class="form-actions">
            <button
              v-if="editingProductId"
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
        >
          <p class="eyebrow">Suppression définitive</p>
          <h2 id="delete-title">Supprimer ce produit ?</h2>
          <p>« {{ form.name }} » sera retiré du catalogue et des choix du planning.</p>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  categoryLabel,
  loadProducts,
  productCategories,
  removeProductFromMeals,
  saveProducts,
  updateProductInMeals,
} from '@/stores/products'

const products = ref(loadProducts())
const search = ref('')
const selectedCategory = ref('all')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const editingProductId = ref(null)
const form = reactive(createEmptyProduct())
const filters = [
  { key: 'all', label: 'Tous' },
  ...productCategories.map(({ key, label }) => ({ key, label })),
]

const filteredProducts = computed(() => {
  const query = search.value.toLocaleLowerCase()
  return products.value.filter(
    (product) =>
      (selectedCategory.value === 'all' || product.category === selectedCategory.value) &&
      product.name.toLocaleLowerCase().includes(query),
  )
})

function createEmptyProduct() {
  return { name: '', category: 'starch' }
}

function openCreateForm() {
  Object.assign(form, createEmptyProduct())
  editingProductId.value = null
  isFormOpen.value = true
}

function openEditForm(product) {
  Object.assign(form, product)
  editingProductId.value = product.id
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  isDeleteDialogOpen.value = false
  editingProductId.value = null
}

function handleKeydown(event) {
  if (event.key !== 'Escape') return
  if (isDeleteDialogOpen.value) {
    closeDeleteDialog()
    return
  }
  if (isFormOpen.value) closeForm()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))

function saveProduct() {
  const product = {
    id:
      editingProductId.value ||
      `${Date.now()}-${form.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: form.name,
    category: form.category,
  }
  products.value = editingProductId.value
    ? products.value.map((item) => (item.id === editingProductId.value ? product : item))
    : [...products.value, product]
  saveProducts(products.value)
  if (editingProductId.value) updateProductInMeals(product)
  closeForm()
}

function requestDelete() {
  isDeleteDialogOpen.value = true
}

function closeDeleteDialog() {
  isDeleteDialogOpen.value = false
}

function confirmDelete() {
  products.value = products.value.filter((product) => product.id !== editingProductId.value)
  saveProducts(products.value)
  removeProductFromMeals(editingProductId.value)
  closeForm()
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
.products-page {
  min-height: 100vh;
  padding: 28px max(20px, calc((100vw - 980px) / 2)) 105px;
}
.page-header {
  align-items: center;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 18px;
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
.page-description {
  color: #66766c;
  font-family: Georgia, serif;
  font-size: 17px;
  margin: 8px 0 0;
}
.primary-button,
.secondary-button,
.delete-button,
.confirm-delete-button {
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
.secondary-button {
  background: #fff;
  border: 1px solid #d8dfd3;
  color: #35443b;
}
.delete-button {
  background: #fff;
  border: 1px solid #efcfc6;
  color: #d7542e;
}
.confirm-delete-button {
  background: #d7542e;
  color: #fff;
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.category-tabs button {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid #d8dfd3;
  border-radius: 22px;
  color: #25362f;
  cursor: pointer;
  font-weight: 700;
  min-height: 42px;
  padding: 0 19px;
}
.category-tabs button.active {
  background: #294d41;
  border-color: #294d41;
  color: #fff;
}
.search-field input,
.form-field input,
.form-field select {
  background: #fff;
  border: 1px solid #d8dfd3;
  border-radius: 15px;
  color: #17251f;
  font: inherit;
  min-height: 50px;
  padding: 0 16px;
  width: 100%;
}
.select-field {
  position: relative;
}
.select-field select {
  appearance: none;
  cursor: pointer;
  padding-right: 48px;
}
.select-field::after {
  border-bottom: 2px solid #294d41;
  border-right: 2px solid #294d41;
  content: '';
  height: 8px;
  pointer-events: none;
  position: absolute;
  right: 19px;
  top: 42px;
  transform: rotate(45deg);
  width: 8px;
}
.search-field input {
  font-size: 17px;
  margin-bottom: 18px;
}
.products-panel {
  background: rgba(255, 255, 255, 0.82);
  border-radius: 18px;
  padding: 18px 16px 16px;
}
.panel-heading {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.panel-heading h2 {
  font-size: 24px;
}
.panel-heading span {
  color: #53665a;
  font-family: Georgia, serif;
}
.product-list {
  display: grid;
  gap: 8px;
}
.product-row {
  align-items: center;
  background: linear-gradient(100deg, #fff, #f3f6f1);
  border: 1px solid #d8dfd3;
  border-radius: 15px;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr auto 30px;
  min-height: 62px;
  padding: 0 18px 0 15px;
  text-align: left;
  width: 100%;
}
.product-row:hover,
.product-row:focus-visible {
  border-color: #294d41;
  outline: none;
}
.product-row strong {
  font-size: 16px;
}
.product-row > span {
  color: #66766c;
  font-family: Georgia, serif;
}
.row-arrow {
  align-items: center;
  background: #f8faf6;
  border: 1px solid #d8dfd3;
  border-radius: 50%;
  display: flex;
  height: 28px;
  justify-content: center;
  position: relative;
  width: 28px;
}
.row-arrow::after {
  border-right: 1.5px solid #294d41;
  border-top: 1.5px solid #294d41;
  content: '';
  height: 6px;
  transform: translateX(-1px) rotate(45deg);
  width: 6px;
}
.empty-state {
  color: #68776d;
  padding: 22px;
  text-align: center;
}
.modal-backdrop,
.confirmation-backdrop {
  align-items: flex-end;
  background: rgba(23, 37, 31, 0.38);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 20;
}
.product-modal {
  background: #f1f4ed;
  border-radius: 24px 24px 0 0;
  max-width: 680px;
  padding: 28px 24px 24px;
  position: relative;
  width: 100%;
}
.product-modal h2 {
  font-size: 28px;
  margin-bottom: 24px;
}
.close-button {
  background: transparent;
  border: 0;
  color: #53665a;
  cursor: pointer;
  font-size: 28px;
  position: absolute;
  right: 18px;
  top: 17px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 17px;
}
.form-field span {
  color: #68776d;
  font-size: 14px;
  font-weight: 700;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}
.confirmation-backdrop {
  align-items: center;
  z-index: 21;
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
.sr-only {
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
}
@media (max-width: 560px) {
  .products-page {
    padding: 22px 14px 105px;
  }
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .primary-button {
    align-self: stretch;
  }
  .page-description {
    font-size: 15px;
  }
  .product-row {
    grid-template-columns: 1fr 30px;
    padding-right: 14px;
  }
  .product-row > span:not(.row-arrow) {
    display: none;
  }
  .form-actions {
    flex-wrap: wrap;
  }
  .form-actions .primary-button {
    flex: 1;
  }
}
</style>
