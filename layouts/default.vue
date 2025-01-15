<script setup>
import { useSkins } from '@core/composable/useSkins'
import { useConfigStore } from '@core/stores/config'
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils'
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const DefaultLayoutWithVerticalNav = defineAsyncComponent(() =>
  import('./components/DefaultLayoutWithVerticalNav.vue'),
)

const configStore = useConfigStore()

switchToVerticalNavOnLtOverlayNavBreakpoint()

// Import layoutAttrs from useSkins
const { layoutAttrs, injectSkinClasses } = useSkins()

injectSkinClasses()

// Filter out the `wrapper` property (VNode) and use only `wrapperProps`
const wrapperProps = computed(() => layoutAttrs.value.verticalNavAttrs.wrapperProps)
const wrapperVNode = computed(() => layoutAttrs.value.verticalNavAttrs.wrapper)

// Determine if the current route is `/role` to skip navigation layout
const route = useRoute()
const isRolePage = computed(() => route.path === '/role')
</script>

<template>
  <div v-if="isRolePage && $slots.default">
    <slot />
  </div>

  <!-- Use wrapperProps for component binding and render VThemeProvider separately -->
  <DefaultLayoutWithVerticalNav
    v-else
    v-bind="wrapperProps"
  >
    <template v-if="wrapperVNode">
      <!-- Render the VThemeProvider wrapper here -->
      <component :is="wrapperVNode">
        <slot />
      </component>
    </template>
    <slot v-else />
  </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";
</style>
