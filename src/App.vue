<template>
  <NavigationBar />
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import NavigationBar from './components/navigationBar.vue'
import { loadHouseholdCode } from './stores/household'
import { subscribeToHousehold } from './services/firebaseSync'

onMounted(() => {
  const householdCode = loadHouseholdCode()
  if (householdCode) subscribeToHousehold(householdCode)
})
</script>

<style scoped></style>
