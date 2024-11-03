<script setup>
import RolesCards from '@/views/apps/roles/RolesCards.vue';

// Apply 'auth' middleware and use the 'blanks' layout
definePageMeta({
  middleware: 'role-auth-middleware',
  layout: 'blank',
})
</script>

<template>
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
</style>
