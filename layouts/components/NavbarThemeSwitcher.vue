<script setup>
const themes = [
  {
    name: 'system',
    icon: 'ri-macbook-line',
  },
  {
    name: 'light',
    icon: 'ri-sun-line',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
  },
]
</script>

<template>
  <ThemeSwitcher v-if="themes && themes.length" :themes="themes" />
</template>

