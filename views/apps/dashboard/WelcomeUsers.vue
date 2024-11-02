<script setup>
import illustrationJohn2 from '@/images/illustration-john-2.png'
import { computed, onMounted, ref } from 'vue'

const selectedRoleToken = ref('')
const tokenExpiration = ref('')

// Adjusted tokenData to match the selectedRoleToken structure
const tokenData = ref({
  userId: null,
  roles: [],
  selectedRole: {},
  permissions: [],
  selectedUnit: null,
  iat: null,
  exp: null,
})

// Load selectedRoleToken from localStorage, decode it, and set expiration time
onMounted(() => {
  selectedRoleToken.value = localStorage.getItem('selectedRoleToken')

  // console.log('Retrieved selectedRoleToken:', selectedRoleToken.value)

  if (selectedRoleToken.value) {
    try {
      // Split the token and decode the payload
      const payload = selectedRoleToken.value.split('.')[1]
      const decoded = JSON.parse(atob(payload))

      console.log('Decoded token structure:', decoded) // Log to inspect structure

      tokenData.value = {
        userId: decoded.userId,
        roles: decoded.roles || [],
        selectedRole: decoded.selectedRole || {},
        permissions: decoded.permissions || [],
        selectedUnit: decoded.selectedUnit || 'None',
        iat: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : null,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : null,
      }

      console.log('Populated tokenData:', tokenData.value)

    } catch (error) {
      console.error('Error decoding token:', error)
    }
  } else {
    console.warn('selectedRoleToken is not available in localStorage.')
  }
})



// Computed variable to calculate remaining time in minutes
const remainingMinutes = computed(() => {
  if (!tokenExpiration.value) return null
  const expirationTime = Number(tokenExpiration.value)
  const currentTime = Date.now()
  const remainingTime = expirationTime - currentTime

  // Convert milliseconds to minutes
  return remainingTime > 0 ? Math.floor(remainingTime / 1000 / 60) : 0
})
</script>

<template>
  <VCard class="overflow-visible mt-sm-10 mt-md-0">
    <VRow no-gutters>
      <VCol
        cols="12"
        sm="6"
        order="2"
        order-sm="1"
      >
        <VCardItem>
          <!--
            <VCardTitle>
            <h4 class="text-h4 text-wrap">
            <strong>ARSIP</strong>
            </h4>
            </VCardTitle> 
          -->
          <!--
            <VCardTitle>
            <h4 class="text-h4 text-wrap">
            <strong>UNIVERSITAS DIPONEGORO</strong>
            </h4>
            </VCardTitle> 
          -->
          <!--
            <VCardTitle>
            <h4 class="text-h4 text-wrap">
            All Roles: <strong>{{ tokenData.roles.length ? tokenData.roles.join(', ') : 'Not available' }}</strong>
            </h4>
            </VCardTitle> 
          -->
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              Anda login sebagai <strong>{{ tokenData.selectedRole?.description || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              Permissions: <strong>{{ tokenData.permissions.length ? tokenData.permissions.join(', ') : 'No permissions' }}</strong>
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              Selected Unit: <strong>{{ tokenData.selectedUnit || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
        </VCardItem>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        order="1"
        order-sm="2"
        class="text-center"
      >
        <img
          :src="illustrationJohn2"
          :height="$vuetify.display.xs ? '165' : '200'"
          :class="$vuetify.display.xs ? 'position-relative' : 'position-absolute'"
          class="john-illustration flip-in-rtl mt-6 mt-sm-0"
        >
      </VCol>
    </VRow>
  </VCard>
</template>


<style lang="scss" scoped>
.john-illustration {
  inset-block-end: -0.0625rem;
  inset-inline-end: 0;
}
</style>
