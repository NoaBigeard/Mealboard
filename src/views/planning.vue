<template>
  <main class="planning-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Mon tableau de repas</p>
        <h1>Planning</h1>
      </div>
      <button class="today-button" type="button" @click="goToToday">Aujourd'hui</button>
    </header>

    <div class="week-date">
      <button
        class="circle-button"
        type="button"
        aria-label="Semaine précédente"
        @click="previousWeek"
      >
        ‹
      </button>
      <p>{{ weekText }}</p>
      <button class="circle-button" type="button" aria-label="Semaine suivante" @click="nextWeek">
        ›
      </button>
    </div>

    <section class="planning-grid" aria-label="Repas de la semaine">
      <article
        v-for="day in days"
        :key="day.key"
        class="planning-card"
        :class="{ today: day.isToday }"
      >
        <div class="day-heading">
          <h2>{{ day.name }}</h2>
          <span>{{ day.number }} {{ day.month }}</span>
        </div>

        <div v-for="meal in mealTypes" :key="meal.key" class="meal-block">
          <div class="meal-title">
            <p class="meal-label">{{ meal.label }}</p>
            <button
              class="recipe-button"
              type="button"
              @click="openRecipePicker(day.key, meal.key)"
            >
              {{ getRecipe(day.key, meal.key) ? 'Changer la recette' : 'Choisir une recette' }}
            </button>
          </div>
          <div
            v-if="getRecipe(day.key, meal.key)"
            class="recipe-choice"
            role="button"
            tabindex="0"
            @click="openRecipePicker(day.key, meal.key)"
            @keydown.enter.prevent="openRecipePicker(day.key, meal.key)"
            @keydown.space.prevent="openRecipePicker(day.key, meal.key)"
          >
            <span class="recipe-badge"><b>Recette</b></span>
            <strong>{{ getRecipe(day.key, meal.key).name }}</strong>
            <small>{{ getRecipe(day.key, meal.key).description }}</small>
            <button
              class="remove-food recipe-remove"
              type="button"
              aria-label="Supprimer la recette"
              @click.stop="removeRecipe(day.key, meal.key)"
            >
              ×
            </button>
          </div>
          <div v-else>
            <div
              v-for="category in categories"
              :key="category.key"
              class="food-slot"
              role="button"
              tabindex="0"
              @click="openPicker(day.key, meal.key, category.key)"
              @keydown.enter.prevent="openPicker(day.key, meal.key, category.key)"
              @keydown.space.prevent="openPicker(day.key, meal.key, category.key)"
            >
              <span class="category-label">{{ category.label }}</span>
              <div v-if="getFood(day.key, meal.key, category.key)" class="chosen-food">
                <button
                  class="food-name"
                  type="button"
                  @click.stop="openPicker(day.key, meal.key, category.key)"
                >
                  {{ getFood(day.key, meal.key, category.key).name }}
                </button>
                <button
                  class="remove-food"
                  type="button"
                  :aria-label="`Supprimer ${getFood(day.key, meal.key, category.key).name}`"
                  @click.stop="removeFood(day.key, meal.key, category.key)"
                >
                  ×
                </button>
              </div>
              <button
                v-else
                class="add-button"
                type="button"
                @click.stop="openPicker(day.key, meal.key, category.key)"
              >
                + Ajouter
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <div v-if="picker.open" class="modal-backdrop" @click.self="closePicker">
      <section class="picker-modal" role="dialog" aria-modal="true" aria-labelledby="picker-title">
        <div class="modal-handle"></div>
        <div class="modal-heading">
          <div>
            <p class="eyebrow">
              {{ picker.mealLabel
              }}<span v-if="picker.mode === 'food'"> · {{ picker.categoryLabel }}</span>
            </p>
            <h2 id="picker-title">
              {{ picker.mode === 'recipe' ? 'Choisir une recette' : 'Choisir un aliment' }}
            </h2>
          </div>
          <button class="close-button" type="button" aria-label="Fermer" @click="closePicker">
            ×
          </button>
        </div>

        <div class="picker-tabs" role="tablist" aria-label="Type de choix">
          <button
            type="button"
            :class="{ active: picker.mode === 'food' }"
            @click="picker.mode = 'food'"
          >
            Aliments
          </button>
          <button
            type="button"
            :class="{ active: picker.mode === 'recipe' }"
            @click="picker.mode = 'recipe'"
          >
            Recettes
          </button>
        </div>
        <div
          v-if="picker.mode === 'food'"
          class="category-tabs"
          role="tablist"
          aria-label="Catégories d'aliments"
        >
          <button
            v-for="category in categories"
            :key="category.key"
            type="button"
            :class="{ active: picker.category === category.key }"
            @click="picker.category = category.key"
          >
            {{ category.label }}
          </button>
        </div>
        <input
          v-model="search"
          class="search-input"
          type="search"
          :placeholder="
            picker.mode === 'recipe' ? 'Rechercher une recette...' : 'Rechercher un aliment...'
          "
          :aria-label="
            picker.mode === 'recipe' ? 'Rechercher une recette' : 'Rechercher un aliment'
          "
        />

        <div v-if="picker.mode === 'food'" class="food-options">
          <button
            v-for="food in filteredFoods"
            :key="food.id"
            type="button"
            class="food-option"
            :class="{ selected: isSelected(food.id) }"
            @click="toggleFood(food)"
          >
            <span>{{ food.name }}</span>
            <span class="food-category">{{ categoryLabel(food.category) }}</span>
            <span class="checkmark">{{ isSelected(food.id) ? '✓' : '+' }}</span>
          </button>
          <p v-if="!filteredFoods.length" class="no-result">Aucun aliment trouvé.</p>
        </div>
        <div v-else class="food-options">
          <button
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            type="button"
            class="food-option"
            @click="chooseRecipe(recipe)"
          >
            <span>{{ recipe.name }}</span>
            <span class="food-category">{{ recipe.description }}</span>
            <span class="checkmark">+</span>
          </button>
          <p v-if="!filteredRecipes.length" class="no-result">Aucune recette trouvée.</p>
        </div>
        <button class="confirm-button" type="button" @click="closePicker">Terminer</button>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const currentDate = ref(new Date())
const search = ref('')
const mealTypes = [
  { key: 'lunch', label: 'Déjeuner' },
  { key: 'dinner', label: 'Dîner' },
]
const categories = [
  { key: 'starch', label: 'Féculents' },
  { key: 'vegetable', label: 'Légumes' },
  { key: 'protein', label: 'Protéines' },
]
const foods = [
  { id: 'rice', name: 'Riz', category: 'starch' },
  { id: 'pasta', name: 'Pâtes', category: 'starch' },
  { id: 'potato', name: 'Pommes de terre', category: 'starch' },
  { id: 'couscous', name: 'Couscous', category: 'starch' },
  { id: 'quinoa', name: 'Quinoa', category: 'starch' },
  { id: 'green-beans', name: 'Haricots verts', category: 'vegetable' },
  { id: 'carrot', name: 'Carottes', category: 'vegetable' },
  { id: 'zucchini', name: 'Courgettes', category: 'vegetable' },
  { id: 'tomato', name: 'Tomates', category: 'vegetable' },
  { id: 'chicken', name: 'Poulet', category: 'protein' },
  { id: 'egg', name: 'Œufs', category: 'protein' },
  { id: 'salmon', name: 'Saumon', category: 'protein' },
  { id: 'lentils', name: 'Lentilles', category: 'protein' },
]
const recipes = [
  { id: 'pizza-salad', name: 'Pizza + salade', description: 'Repas complet' },
  { id: 'quiche-salad', name: 'Quiche + salade', description: 'Repas complet' },
  { id: 'curry-chicken', name: 'Curry de poulet', description: 'Plat préparé' },
  { id: 'lasagna', name: 'Lasagnes', description: 'Plat préparé' },
]
const meals = ref(loadMeals())
const picker = reactive({
  open: false,
  dayKey: '',
  mealKey: '',
  category: 'starch',
  mealLabel: '',
  categoryLabel: '',
  mode: 'food',
})

function getMonday(date) {
  const result = new Date(date)
  const day = result.getDay()

  const difference = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + difference)
  return result
}

const days = computed(() => {
  const monday = getMonday(currentDate.value)

  const result = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    result.push({
      date,
      key: date.toISOString().slice(0, 10),
      isToday: isSameDay(date, new Date()),
      name: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
      number: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
    })
  }
  return result
})

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function formatDate(date) {
  const dayList = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const day = dayList[date.getDay()]
  return (
    day +
    ' ' +
    date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    })
  )
}

const weekText = computed(() => {
  const monday = days.value[0].date
  const sunday = days.value[6].date

  return `${formatDate(monday)} → ${formatDate(sunday)}`
})

function previousWeek() {
  currentDate.value.setDate(currentDate.value.getDate() - 7)
  currentDate.value = new Date(currentDate.value)
}

function nextWeek() {
  currentDate.value.setDate(currentDate.value.getDate() + 7)
  currentDate.value = new Date(currentDate.value)
}

function goToToday() {
  currentDate.value = new Date()
}

const filteredFoods = computed(() =>
  foods.filter(
    (food) =>
      food.category === picker.category &&
      food.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
  ),
)
const filteredRecipes = computed(() =>
  recipes.filter((recipe) =>
    recipe.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
  ),
)

function getFood(dayKey, mealKey, categoryKey) {
  return meals.value[dayKey]?.[mealKey]?.[categoryKey] || null
}

function getRecipe(dayKey, mealKey) {
  return meals.value[dayKey]?.[mealKey]?.recipe || null
}

function openPicker(dayKey, mealKey, categoryKey) {
  picker.dayKey = dayKey
  picker.mealKey = mealKey
  picker.category = categoryKey
  picker.mode = 'food'
  picker.mealLabel = mealTypes.find((meal) => meal.key === mealKey).label
  picker.categoryLabel = categoryLabel(categoryKey)
  search.value = ''
  picker.open = true
}

function openRecipePicker(dayKey, mealKey) {
  picker.dayKey = dayKey
  picker.mealKey = mealKey
  picker.mode = 'recipe'
  picker.mealLabel = mealTypes.find((meal) => meal.key === mealKey).label
  picker.categoryLabel = ''
  search.value = ''
  picker.open = true
}

function closePicker() {
  picker.open = false
}

function handleKeydown(event) {
  if (event.key === 'Escape' && picker.open) {
    closePicker()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))

function isSelected(foodId) {
  return getFood(picker.dayKey, picker.mealKey, picker.category)?.id === foodId
}

function toggleFood(food) {
  const dayMeals = meals.value[picker.dayKey] || { lunch: emptyMeal(), dinner: emptyMeal() }
  dayMeals[picker.mealKey] = {
    ...emptyMeal(),
    ...(dayMeals[picker.mealKey] || emptyMeal()),
    recipe: null,
    [picker.category]: isSelected(food.id) ? null : food,
  }
  meals.value = { ...meals.value, [picker.dayKey]: dayMeals }
  closePicker()
}

function chooseRecipe(recipe) {
  const dayMeals = meals.value[picker.dayKey] || { lunch: emptyMeal(), dinner: emptyMeal() }
  dayMeals[picker.mealKey] = { ...emptyMeal(), recipe }
  meals.value = { ...meals.value, [picker.dayKey]: dayMeals }
  closePicker()
}

function removeFood(dayKey, mealKey, categoryKey) {
  const dayMeals = meals.value[dayKey]
  meals.value = {
    ...meals.value,
    [dayKey]: { ...dayMeals, [mealKey]: { ...dayMeals[mealKey], [categoryKey]: null } },
  }
}

function removeRecipe(dayKey, mealKey) {
  const dayMeals = meals.value[dayKey]
  meals.value = {
    ...meals.value,
    [dayKey]: { ...dayMeals, [mealKey]: { ...dayMeals[mealKey], recipe: null } },
  }
}

function categoryLabel(category) {
  return categories.find((item) => item.key === category)?.label || category
}

function loadMeals() {
  try {
    return migrateMeals(JSON.parse(localStorage.getItem('mealboard-meals') || '{}'))
  } catch {
    return {}
  }
}

function emptyMeal() {
  return { starch: null, vegetable: null, protein: null, recipe: null }
}

function migrateMeals(storedMeals) {
  return Object.fromEntries(
    Object.entries(storedMeals).map(([dayKey, dayMeals]) => [
      dayKey,
      Object.fromEntries(
        Object.entries(dayMeals).map(([mealKey, meal]) => [
          mealKey,
          Array.isArray(meal)
            ? meal.reduce((result, food) => ({ ...result, [food.category]: food }), emptyMeal())
            : { ...emptyMeal(), ...meal },
        ]),
      ),
    ]),
  )
}

watch(meals, (value) => localStorage.setItem('mealboard-meals', JSON.stringify(value)), {
  deep: true,
})
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  background: #edf1e9;
  color: #25362f;
  font-family: Georgia, 'Times New Roman', serif;
}
.planning-page {
  min-height: 100vh;
  padding: 28px clamp(16px, 5vw, 72px) 96px;
}
.page-header,
.week-date,
.day-heading,
.meal-title,
.modal-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.page-header {
  max-width: 1120px;
  margin: 0 auto 24px;
}
.eyebrow {
  margin: 0 0 5px;
  color: #758477;
  font:
    600 11px/1.2 Arial,
    sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
h1,
h2,
p {
  margin-top: 0;
}
h1 {
  margin-bottom: 0;
  font-size: clamp(30px, 5vw, 48px);
}
.today-button,
.confirm-button {
  border: 0;
  border-radius: 8px;
  background: #294d41;
  color: white;
  cursor: pointer;
  font:
    700 14px Arial,
    sans-serif;
  padding: 13px 18px;
}
.week-date {
  max-width: 1120px;
  margin: 0 auto 22px;
}
.week-date p {
  margin: 0;
  font-size: 18px;
  text-align: center;
}
.circle-button {
  width: 42px;
  height: 42px;
  border: 1px solid #d5ddd1;
  border-radius: 50%;
  background: #fff;
  color: #294d41;
  cursor: pointer;
  font-size: 28px;
  line-height: 1;
}
.planning-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(285px, 1fr));
  gap: 14px;
  max-width: 1120px;
  margin: auto;
}
.planning-card {
  border: 1px solid #d5ddd1;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  padding: 16px;
  box-shadow: 0 8px 24px rgba(49, 69, 59, 0.05);
}
.planning-card.today {
  border: 2px solid #294d41;
  box-shadow: 0 8px 24px rgba(41, 77, 65, 0.14);
}
.day-heading {
  border-bottom: 1px solid #dde4da;
  padding-bottom: 12px;
}
.day-heading h2 {
  margin: 0;
  font-size: 22px;
  text-transform: capitalize;
}
.planning-card.today .day-heading h2,
.planning-card.today .day-heading span {
  color: #294d41;
  font-weight: 700;
}
.day-heading span {
  color: #718078;
  font:
    13px Arial,
    sans-serif;
  text-transform: capitalize;
}
.meal-block {
  background: #eef3eb;
  border-radius: 10px;
  margin-top: 12px;
  padding: 10px;
}
.meal-label {
  color: #66766c;
  font:
    700 11px Arial,
    sans-serif;
  letter-spacing: 0.12em;
  margin: 0 0 7px;
  text-transform: uppercase;
}
.meal-title .meal-label {
  margin-bottom: 0;
}
.recipe-button {
  border: 0;
  background: transparent;
  color: #294d41;
  cursor: pointer;
  font:
    700 12px Arial,
    sans-serif;
  padding: 4px 0;
}
.recipe-choice {
  align-items: center;
  border: 1px solid #b8cbbb;
  border-radius: 9px;
  background: #e1eadf;
  color: #294d41;
  cursor: pointer;
  display: grid;
  gap: 4px 12px;
  grid-template-columns: 42px minmax(0, 1fr) 28px;
  margin-top: 5px;
  min-height: 58px;
  padding: 10px 8px 10px 11px;
}
.recipe-choice:focus-visible {
  outline: 2px solid #294d41;
  outline-offset: 2px;
}
.recipe-badge {
  align-self: center;
  grid-column: 1;
  grid-row: 1 / span 2;
  justify-self: center;
  color: #61776a;
  font:
    700 10px Arial,
    sans-serif;
  letter-spacing: 0.1em;
  transform: rotate(-90deg);
  white-space: nowrap;
  text-align: center;
}
.recipe-choice strong {
  grid-column: 2;
  grid-row: 1;
  font:
    700 14px Arial,
    sans-serif;
  text-align: center;
}
.recipe-choice small {
  grid-column: 2;
  grid-row: 2;
  color: #758477;
  font:
    12px Arial,
    sans-serif;
  text-align: center;
}
.recipe-remove {
  align-self: center;
  grid-column: 3;
  grid-row: 1 / span 2;
  justify-self: end;
}
.food-slot {
  align-items: center;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid #e0e6dd;
  border-radius: 9px;
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  min-height: 39px;
  padding: 6px 9px 6px 11px;
}
.food-slot {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}
.food-slot:hover,
.food-slot:focus-visible {
  background: #f7fbf5;
  border-color: #294d41;
  outline: none;
}
.category-label {
  color: #758477;
  font:
    10px Arial,
    sans-serif;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.add-button {
  border: 0;
  background: none;
  color: #294d41;
  cursor: pointer;
  font:
    700 13px Arial,
    sans-serif;
  padding: 4px 0;
}
.chosen-food {
  align-items: center;
  display: flex;
  gap: 9px;
}
.food-name,
.remove-food {
  border: 0;
  background: none;
  cursor: pointer;
  padding: 4px 0;
}
.food-name {
  color: #294d41;
  font:
    700 13px Arial,
    sans-serif;
}
.remove-food {
  color: #829087;
  font-size: 17px;
}
.close-button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}
.modal-backdrop {
  align-items: flex-end;
  background: rgba(36, 48, 42, 0.5);
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 5;
}
.picker-modal {
  background: #f7f9f3;
  border-radius: 26px 26px 0 0;
  max-height: 88vh;
  padding: 18px clamp(18px, 5vw, 32px) 22px;
  width: min(100%, 650px);
}
.modal-handle {
  background: #dbe3d7;
  border-radius: 4px;
  height: 5px;
  margin: 0 auto 20px;
  width: 48px;
}
.modal-heading h2 {
  margin: 0;
  font-size: 26px;
}
.close-button {
  color: #294d41;
  font-size: 28px;
}
.category-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 18px 0 12px;
}
.category-tabs button,
.search-input,
.food-option,
.confirm-button {
  font:
    15px Arial,
    sans-serif;
}
.category-tabs button {
  border: 1px solid #d5ddd1;
  border-radius: 8px;
  background: #fff;
  color: #294d41;
  cursor: pointer;
  padding: 12px 8px;
}
.category-tabs button.active {
  background: #294d41;
  color: #fff;
}
.picker-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 18px 0 12px;
}
.picker-tabs button {
  border: 1px solid #d5ddd1;
  border-radius: 8px;
  background: #fff;
  color: #294d41;
  cursor: pointer;
  font:
    700 14px Arial,
    sans-serif;
  padding: 12px 8px;
}
.picker-tabs button.active {
  background: #294d41;
  color: #fff;
}
.search-input {
  border: 1px solid #d5ddd1;
  border-radius: 8px;
  padding: 14px 16px;
  width: 100%;
}
.food-options {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 14px 0;
  max-height: 42vh;
  overflow-y: auto;
}
.food-option {
  align-items: center;
  border: 1px solid #d5ddd1;
  border-radius: 12px;
  background: #fff;
  color: #35443c;
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr auto 24px;
  gap: 8px;
  padding: 14px 16px;
  text-align: left;
}
.food-option.selected {
  border-color: #294d41;
  background: #e9f0e6;
}
.food-category {
  color: #758477;
  font-size: 12px;
}
.checkmark {
  color: #294d41;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}
.no-result {
  color: #758477;
  font:
    14px Arial,
    sans-serif;
  padding: 18px;
  text-align: center;
}
.confirm-button {
  background: #fff;
  border: 1px solid #d5ddd1;
  color: #294d41;
  width: 100%;
}
@media (max-width: 680px) {
  .planning-page {
    padding: 18px 12px 34px;
  }
  .planning-grid {
    grid-template-columns: 1fr;
  }
  .planning-card {
    padding: 14px;
  }
  .page-header {
    margin-bottom: 18px;
  }
  .today-button {
    padding: 10px 12px;
  }
}
</style>
