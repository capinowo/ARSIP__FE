<script setup>
import { useConfigStore } from '@core/stores/config';
import { AppContentLayoutNav } from '@layouts/enums';
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils';
import { useRoute } from 'vue-router';

const DefaultLayoutWithHorizontalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithHorizontalNav.vue'))
const DefaultLayoutWithVerticalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithVerticalNav.vue'))
const configStore = useConfigStore()

switchToVerticalNavOnLtOverlayNavBreakpoint()

const { layoutAttrs, injectSkinClasses } = useSkins()
injectSkinClasses()

const route = useRoute()
// Determine if current route is `/role` to skip navigation layout
const isRolePage = route.path === '/role'
</script>

<template>
  <div v-if="isRolePage">
    <slot /> <!-- Render only slot content on /role page -->
  </div>
  <Component
    v-else
    v-bind="layoutAttrs"
    :is="configStore.appContentLayoutNav === AppContentLayoutNav.Vertical ? DefaultLayoutWithVerticalNav : DefaultLayoutWithHorizontalNav"
  >
    <slot />
  </Component>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";
</style>
