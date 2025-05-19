<script setup>
import illustrationJohn2 from '@/images/illustration-john-2.png';
import { getSelectedUnitToken } from '@/middleware/auth'; // Corrected the import for named export
import { useTokenStore } from '@/stores/tokenStores';
import { computed, onMounted, ref } from 'vue';

const tokenStore = useTokenStore()
const selectedRoleToken = ref('')

// Adjusted tokenData to match the selectedRoleToken structure
const tokenData = ref({
  userId: null,
  roles: [],
  selectedRole: {},
  permissions: [],
  selectedUnit: [],
  iat: null,
  exp: null,
})

// Load selectedRoleToken from localStorage, decode it, and set expiration time
onMounted(() => {
  selectedRoleToken.value = getSelectedUnitToken()

  // console.log('Selected Role Token:', selectedRoleToken.value)

  if (selectedRoleToken.value) {
    try {
      // Split the token and decode the payload
      const payload = selectedRoleToken.value.split('.')[1]
      const decoded = JSON.parse(atob(payload))

      tokenData.value = {
        userId: decoded.userId,
        roles: decoded.roles || [],
        selectedRole: decoded.selectedRole || {},
        permissions: decoded.permissions || [],
        selectedUnit: decoded.selectedUnit || [],
        iat: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : null,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : null,
      }

      // console.log('tokenData:', tokenData.value)
      tokenStore.setTokenData(tokenData.value)

      // console.log(userId)

      // Store expiration time in a separate variable
      if (decoded.exp) {
        tokenExpiration.value = decoded.exp * 1000 // Store the expiration as a timestamp
      }

    } catch (error) {
      console.error('Error decoding token:', error)
    }
  } else {
    console.warn('selectedRoleToken is not available.')
  }
})

const tokenExpiration = ref('')

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
    <VCardItem>
      <VCardTitle>
        <h4 class="text-h4 text-wrap">
          Anda login sebagai: <strong>{{ tokenData.selectedRole?.description || 'Not available' }}</strong>
        </h4>
      </VCardTitle>
      <VCardTitle>
        <h4 class="text-h4 text-wrap">
          Permissions: <strong>{{ tokenData.permissions.length ? tokenData.permissions.join(', ') : 'No permissions'
          }}</strong>
        </h4>
      </VCardTitle>
      <VCardTitle>
        <h4 class="text-h4 text-wrap">
          Selected Unit: <strong>{{ tokenData.selectedUnit?.name || 'Not available' }}</strong>
        </h4>
      </VCardTitle>
      <VCardTitle>
        <h4 class="text-h4 text-wrap">
          Remaining Time: <strong>{{ remainingMinutes }} minutes</strong>
        </h4>
      </VCardTitle>

      <!-- Avatar & Welcome Message Section Dipindah ke sini -->
      <VRow class="mt-4">
        <VCol cols="4">
          <VAvatar size="large">
            <img :src="illustrationJohn2" alt="User Avatar">
          </VAvatar>
        </VCol>
        <VCol cols="8">
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              Selamat datang, <strong>{{ tokenData.selectedRole?.description || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              <strong>{{ tokenData.selectedRole?.description || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
          <VCardTitle>
            <h4 class="text-h4 text-wrap">
              <strong>{{ tokenData.selectedUnit?.name || 'Not available' }}</strong>
            </h4>
          </VCardTitle>
        </VCol>
      </VRow>
    </VCardItem>
  </VCard>
</template>





<style lang="scss" scoped>
.john-illustration {
  inset-block-end: -0.0625rem;
  inset-inline-end: 0;
}
</style>
