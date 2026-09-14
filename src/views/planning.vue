<template>
    <div class="weekDate">
      <button @click="previousWeek()">←</button>
      <p>{{ weekText }}</p>
      <button @click="nextWeek()">→</button>
    </div>

    <div v-for="day in days" :key="day.toISOString()" class="planningCard">
      {{ formatDate(day) }}
      <li v-for="(type, index) in mealType">{{ mealType.type }}</li>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const mealType = ref([{ type: 'Déjeuner' }, { type: 'Dîner' }])
const currentDate = ref(new Date())

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
    result.push(date)
  }
  return result
})

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
  const monday = days.value[0]
  const sunday = days.value[6]

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
</script>

<style scoped>
.planningCard {
  background-color: antiquewhite;
  max-width: 50%;
  text-align: center;
}
</style>
