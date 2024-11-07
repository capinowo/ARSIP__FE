<script setup>
import { useTheme } from '@/composables/useTheme';

const { theme, setTheme } = useTheme()

const themes = [
  // { name: 'system', icon: 'ri-macbook-line' },
  { name: 'light', icon: 'ri-sun-line' },
  { name: 'dark', icon: 'ri-moon-clear-line' },
]

onMounted(() => {
  setTheme('light') // Set default ke 'light' pada halaman login
})
</script>

<template>
  <ThemeSwitcher v-if="themes && themes.length" :themes="themes" :current-theme="theme" @theme-change="setTheme" />
</template>
