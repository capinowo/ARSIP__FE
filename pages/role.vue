<script setup>
import RolesCards from '@/views/apps/roles/RolesCards.vue'
import { useState } from 'nuxt/app'

const isLoading = useState('isLoading')

// Apply 'auth' middleware and use the 'blanks' layout
definePageMeta({
  middleware: 'role-auth-middleware',
  layout: 'blank',
})
</script>

<template>
  <div
    v-if="isLoading"
    class="loading-overlay"
  >
    <!-- Loading Spinner -->
    <div class="spinner" />
  </div>
  <VRow
    class="px-12 py-12 align-items-start"
    style="margin-block-start: 1rem;"
  >
    <!-- Roles Cards Section aligned to the top -->
    <VCol
      cols="12"
      class="mt-0"
    >
      <RolesCards />
    </VCol>
  </VRow>
</template>

<style scoped>
/* General padding adjustments */
.layout-wrapper.layout-blank {
  padding-block-start: 1rem;
}

.VRow {
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 1200px;
}

/* Ensure RolesCards aligns to the top */
.VCol {
  padding-inline: 1rem;
}

.loading-overlay {
  position: fixed;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 70%);
  block-size: 100%;
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 10%);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  block-size: 40px;
  border-inline-start-color: #000;
  inline-size: 40px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
