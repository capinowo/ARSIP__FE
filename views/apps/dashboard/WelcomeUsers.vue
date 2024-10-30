<script setup>
import illustrationJohn2 from '@/images/illustration-john-2.png'
import { jwtDecode } from 'jwt-decode'
import { computed, onMounted, ref } from 'vue'



// State for storing token, expiration, and decoded token data
definePageMeta({
  middleware: 'auth', // Apply 'auth' middleware only on this page
})

const authToken = ref('')
const tokenExpiration = ref('')

const tokenData = ref({
  userId: null,
  name: '',
  email: '',
  sessionRoles: [],
  selectedRole: '',
  iat: null,
  exp: null,
})

// Load token from localStorage, decode it, and calculate expiration time
onMounted(() => {
  authToken.value = localStorage.getItem('authToken')
  tokenExpiration.value = localStorage.getItem('tokenExpiration')

  // Decode the token to extract data if token exists
  if (authToken.value) {
    const decoded = jwtDecode(authToken.value)

    tokenData.value = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      sessionRoles: decoded.sessionRoles,
      selectedRole: decoded.selectedRole,
      iat: new Date(decoded.iat * 1000).toLocaleString(), // Convert iat to date
      exp: new Date(decoded.exp * 1000).toLocaleString(),  // Convert exp to date
    }
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
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              Welcome !   <strong>{{ tokenData.name || 'Not available' }}</strong>  <span class="text-high-emphasis">🎉</span>
            </h4>
          </VCardTitle>
        </VCardItem>

        <VCardText><strong>Email:</strong> {{ tokenData.email || 'Not available' }}</VCardText>
        <VCardText><strong>Session Roles:</strong> {{ tokenData.sessionRoles.join(', ') || 'Not available' }}</VCardText>
        <VCardText><strong>Selected Role:</strong> {{ tokenData.selectedRole || 'Not available' }}</VCardText>
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
