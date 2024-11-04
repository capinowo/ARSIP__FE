<script setup>
import { useSkins } from '@core/composable/useSkins'; // Adjust path as needed
import { useConfigStore } from '@core/stores/config';
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils';
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

const DefaultLayoutWithVerticalNav = defineAsyncComponent(() =>
  import('./components/DefaultLayoutWithVerticalNav.vue')
);
const configStore = useConfigStore();

switchToVerticalNavOnLtOverlayNavBreakpoint();

// Import layoutAttrs from useSkins and make it reactive
const { layoutAttrs, injectSkinClasses } = useSkins();
injectSkinClasses();

// Wrap layoutAttrs in a computed property for better reactivity
const reactiveLayoutAttrs = computed(() => layoutAttrs.value || {});

const route = useRoute();
// Determine if current route is `/role` to skip navigation layout
const isRolePage = computed(() => route.path === '/role');
</script>

<template>
  <!-- Render only slot content on /role page -->
  <div v-if="isRolePage">
    <slot />
  </div>
  
  <!-- Render layout with vertical navigation for other pages -->
  <component
    v-else
    v-bind="reactiveLayoutAttrs"
    :is="DefaultLayoutWithVerticalNav"
  >
    <slot />
  </component>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";
</style>
