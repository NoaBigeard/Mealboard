<template>
  <nav class="navigation-bar" aria-label="Navigation principale">
    <RouterLink
      v-for="item in navigationItems"
      :key="item.name"
      :to="{ name: item.name }"
      class="navigation-link"
    >
      <span class="navigation-icon" aria-hidden="true">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
<script setup>
const navigationItems = [
  { name: 'Planning', label: 'Planning', icon: '▦' },
  { name: 'Recipes', label: 'Recettes', icon: '♨' },
  { name: 'Products', label: 'Produits', icon: '▱' },
  { name: 'Courses', label: 'Courses', icon: '☷' },
  { name: 'Reglage', label: 'Réglages', icon: '⚙' },
]
</script>

<style scoped>
.navigation-bar {
  align-items: stretch;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #dce4d9;
  bottom: 0;
  box-shadow: 0 -8px 24px rgba(49, 69, 59, 0.08);
  display: flex;
  justify-content: center;
  left: 0;
  padding: 8px max(10px, env(safe-area-inset-left)) max(8px, env(safe-area-inset-bottom));
  position: fixed;
  right: 0;
  z-index: 10;
}
.navigation-link {
  align-items: center;
  color: #829087;
  display: flex;
  flex: 1;
  flex-direction: column;
  font:
    11px Arial,
    sans-serif;
  gap: 4px;
  justify-content: center;
  max-width: 112px;
  min-height: 48px;
  text-decoration: none;
}
.navigation-icon {
  font-size: 22px;
  line-height: 1;
}
.navigation-link.router-link-active {
  color: #294d41;
  font-weight: 700;
}
.navigation-link.router-link-active .navigation-icon {
  transform: translateY(-1px);
}
@media (min-width: 681px) {
  .navigation-bar {
    border: 0;
    box-shadow: none;
    justify-content: flex-end;
    padding: 16px 32px 0;
    position: static;
  }
  .navigation-link {
    flex: 0 0 auto;
    flex-direction: row;
    font-size: 14px;
    gap: 6px;
    min-height: auto;
    padding: 8px 12px;
  }
  .navigation-icon {
    font-size: 18px;
  }
}
</style>
<style>
a {
  text-decoration: none;
  color: black;
}
</style>
