const RECIPES_STORAGE_KEY = 'mealboard-recipes'

import { syncCurrentState } from '@/services/firebaseSync'

const defaultRecipes = [
  {
    id: 'crepes',
    name: 'Crêpes',
    servings: 4,
    ingredients: ['Farine', 'Œufs', 'Lait', 'Sucre'],
    steps: [],
  },
  { id: 'quiche-lorraine', name: 'Quiche lorraine', servings: 4, ingredients: [], steps: [] },
  { id: 'pizza', name: 'Pizza', servings: 2, ingredients: [], steps: [] },
  { id: 'salade-cesar', name: 'Salade César', servings: 2, ingredients: [], steps: [] },
  { id: 'ratatouille', name: 'Ratatouille', servings: 4, ingredients: [], steps: [] },
  { id: 'curry-poulet', name: 'Curry de poulet', servings: 4, ingredients: [], steps: [] },
  { id: 'bolognaise', name: 'Bolognaise', servings: 4, ingredients: [], steps: [] },
  {
    id: 'puree-pommes-de-terre',
    name: 'Purée de pommes de terre',
    servings: 4,
    ingredients: [],
    steps: [],
  },
  { id: 'wrap', name: 'Wrap', servings: 2, ingredients: [], steps: [] },
]

export function loadRecipes() {
  try {
    const storedRecipes = JSON.parse(localStorage.getItem(RECIPES_STORAGE_KEY) || 'null')
    return Array.isArray(storedRecipes) ? storedRecipes : defaultRecipes
  } catch {
    return defaultRecipes
  }
}

export function saveRecipes(recipes) {
  localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes))
  syncCurrentState()
}

export function removeRecipeFromMeals(recipeId) {
  try {
    const storedMeals = JSON.parse(localStorage.getItem('mealboard-meals') || '{}')
    const cleanedMeals = Object.fromEntries(
      Object.entries(storedMeals).map(([dayKey, dayMeals]) => [
        dayKey,
        Object.fromEntries(
          Object.entries(dayMeals).map(([mealKey, meal]) => [
            mealKey,
            meal?.recipe?.id === recipeId ? { ...meal, recipe: null } : meal,
          ]),
        ),
      ]),
    )
    localStorage.setItem('mealboard-meals', JSON.stringify(cleanedMeals))
  } catch {
    return
  }
}

export function updateRecipeInMeals(recipe) {
  try {
    const storedMeals = JSON.parse(localStorage.getItem('mealboard-meals') || '{}')
    const updatedMeals = Object.fromEntries(
      Object.entries(storedMeals).map(([dayKey, dayMeals]) => [
        dayKey,
        Object.fromEntries(
          Object.entries(dayMeals).map(([mealKey, meal]) => [
            mealKey,
            meal?.recipe?.id === recipe.id ? { ...meal, recipe: { ...recipe } } : meal,
          ]),
        ),
      ]),
    )
    localStorage.setItem('mealboard-meals', JSON.stringify(updatedMeals))
  } catch {
    return
  }
}
