const PRODUCTS_STORAGE_KEY = 'mealboard-products'

import { syncCurrentState } from '@/services/firebaseSync'

export const productCategories = [
  { key: 'starch', label: 'Féculents' },
  { key: 'protein', label: 'Protéines' },
  { key: 'vegetable', label: 'Légumes' },
]

const defaultProducts = [
  { id: 'rice', name: 'Riz', category: 'starch' },
  { id: 'pasta', name: 'Pâtes', category: 'starch' },
  { id: 'potato', name: 'Pommes de terre', category: 'starch' },
  { id: 'couscous', name: 'Couscous', category: 'starch' },
  { id: 'quinoa', name: 'Quinoa', category: 'starch' },
  { id: 'bagel', name: 'Bagel', category: 'starch' },
  { id: 'bulgur', name: 'Boulgour', category: 'starch' },
  { id: 'oat-flakes', name: "Flocons d'avoine", category: 'starch' },
  { id: 'white-beans', name: 'Haricots blancs', category: 'starch' },
  { id: 'corn', name: 'Maïs', category: 'starch' },
  { id: 'sweet-potato', name: 'Patate douce', category: 'starch' },
  { id: 'sweetcorn', name: 'Polenta', category: 'starch' },
  { id: 'semolina', name: 'Semoule', category: 'starch' },
  { id: 'bulgur-wheat', name: 'Boulgour de blé', category: 'starch' },
  { id: 'bread', name: 'Pain', category: 'starch' },
  { id: 'tortilla', name: 'Tortillas', category: 'starch' },
  { id: 'noodles', name: 'Nouilles', category: 'starch' },
  { id: 'lasagna-sheets', name: 'Feuilles de lasagne', category: 'starch' },
  { id: 'chickpeas', name: 'Pois chiches', category: 'protein' },
  { id: 'kidney-beans', name: 'Haricots rouges', category: 'protein' },
  { id: 'white-fish', name: 'Poisson blanc', category: 'protein' },
  { id: 'cod', name: 'Cabillaud', category: 'protein' },
  { id: 'shrimp', name: 'Crevettes', category: 'protein' },
  { id: 'turkey', name: 'Dinde', category: 'protein' },
  { id: 'beef', name: 'Bœuf', category: 'protein' },
  { id: 'pork', name: 'Porc', category: 'protein' },
  { id: 'tofu', name: 'Tofu', category: 'protein' },
  { id: 'red-pepper', name: 'Poivrons rouges', category: 'vegetable' },
  { id: 'green-pepper', name: 'Poivrons verts', category: 'vegetable' },
  { id: 'broccoli', name: 'Brocolis', category: 'vegetable' },
  { id: 'cauliflower', name: 'Chou-fleur', category: 'vegetable' },
  { id: 'spinach', name: 'Épinards', category: 'vegetable' },
  { id: 'leek', name: 'Poireaux', category: 'vegetable' },
  { id: 'mushroom', name: 'Champignons', category: 'vegetable' },
  { id: 'onion', name: 'Oignons', category: 'vegetable' },
  { id: 'garlic', name: 'Ail', category: 'vegetable' },
  { id: 'pumpkin', name: 'Courge', category: 'vegetable' },
  { id: 'peas', name: 'Petits pois', category: 'vegetable' },
  { id: 'cucumber', name: 'Concombre', category: 'vegetable' },
  { id: 'chicken', name: 'Poulet', category: 'protein' },
  { id: 'egg', name: 'Œufs', category: 'protein' },
  { id: 'salmon', name: 'Saumon', category: 'protein' },
  { id: 'lentils', name: 'Lentilles', category: 'protein' },
  { id: 'tuna', name: 'Thon', category: 'protein' },
  { id: 'green-beans', name: 'Haricots verts', category: 'vegetable' },
  { id: 'carrot', name: 'Carottes', category: 'vegetable' },
  { id: 'zucchini', name: 'Courgettes', category: 'vegetable' },
  { id: 'tomato', name: 'Tomates', category: 'vegetable' },
  { id: 'eggplant', name: 'Aubergine', category: 'vegetable' },
]

export function loadProducts() {
  try {
    const storedProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || 'null')
    if (!Array.isArray(storedProducts)) return defaultProducts
    const storedIds = new Set(storedProducts.map((product) => product.id))
    return [...storedProducts, ...defaultProducts.filter((product) => !storedIds.has(product.id))]
  } catch {
    return defaultProducts
  }
}

export function saveProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
  syncCurrentState()
}

export function categoryLabel(category) {
  return productCategories.find((item) => item.key === category)?.label || category
}

export function updateProductInMeals(product) {
  updateProductReferences(product.id, () => ({ ...product }))
}

export function removeProductFromMeals(productId) {
  updateProductReferences(productId, () => null)
}

function updateProductReferences(productId, getReplacement) {
  try {
    const storedMeals = JSON.parse(localStorage.getItem('mealboard-meals') || '{}')
    const updatedMeals = Object.fromEntries(
      Object.entries(storedMeals).map(([dayKey, dayMeals]) => [
        dayKey,
        Object.fromEntries(
          Object.entries(dayMeals).map(([mealKey, meal]) => {
            if (!meal) return [mealKey, meal]
            const updatedMeal = { ...meal }
            for (const category of ['starch', 'vegetable', 'protein']) {
              if (updatedMeal[category]?.id === productId) {
                updatedMeal[category] = getReplacement()
              }
            }
            return [mealKey, updatedMeal]
          }),
        ),
      ]),
    )
    localStorage.setItem('mealboard-meals', JSON.stringify(updatedMeals))
  } catch {
    return
  }
}
