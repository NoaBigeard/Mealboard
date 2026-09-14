<template>
  <RouterLink :to="{ name: 'Planning' }"> 📅 Planning</RouterLink>
  <RouterLink :to="{ name: 'Recipes' }"> 🍲 Recette</RouterLink>
  <RouterLink :to="{ name: 'Products' }"> 🧺 Produits</RouterLink>
  <RouterLink :to="{ name: 'Courses' }"> 🛒 Course</RouterLink>
  <RouterLink :to="{ name: 'Reglage' }"> ⚙️ Réglage</RouterLink>
</template>
<script></script>
<style>
a{
    text-decoration: none;
    color: black;
}
</style>
