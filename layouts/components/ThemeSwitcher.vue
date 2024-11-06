<script setup>
import { onMounted, ref } from 'vue';

// Props dari `NavbarThemeSwitcher.vue`
const props = defineProps({
  themes: {
    type: Array,
    required: true,
  },
})

// Simpan tema aktif
const activeTheme = ref('light') // Default tema jika belum ada yang disimpan

// Ketika komponen di-mount, ambil tema yang disimpan di local storage
onMounted(() => {
  try {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      activeTheme.value = savedTheme
    } else {
      // Simpan default theme jika belum ada yang tersimpan
      localStorage.setItem('theme', 'light')
    }
  } catch (error) {
    console.error('Error loading theme:', error)
  }
})

// Fungsi untuk mengganti tema
function switchTheme(themeName) {
  activeTheme.value = themeName
  localStorage.setItem('theme', themeName)
}
</script>

<template>
  <div>
    <p>Current Theme: {{ activeTheme }}</p>
    <div v-for="theme in themes" :key="theme.name" @click="switchTheme(theme.name)">
      <span :class="theme.icon"></span> {{ theme.name }}
    </div>
  </div>
</template>
