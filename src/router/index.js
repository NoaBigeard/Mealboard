import Course from '@/views/course.vue'
import Planning from '@/views/planning.vue'
import Products from '@/views/products.vue'
import Recipe from '@/views/recipe.vue'
import Settings from '@/views/settings.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/Planning',
      name: 'Planning',
      component: Planning,
    },
    {
      path: '/Recipes',
      name: 'Recipes',
      component: Recipe,
    },
    {
      path: '/Products',
      name: 'Products',
      component: Products,
    },
    {
      path: '/Courses',
      name: 'Courses',
      component: Course,
    },
    {
      path: '/Settings',
      name: 'Reglage',
      component: Settings,
    },
  ],
})

export default router
