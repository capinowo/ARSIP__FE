<script setup>
import { getAuthToken, setSelectedUnitToken } from '@/middleware/auth'
import { useUnitStore } from '@/stores/unitStore' // Import store untuk unit data
import { navigateTo } from 'nuxt/app'
import { computed, ref } from 'vue'

const unitStore = useUnitStore() // Akses unitStore
const isLoading = ref(false) // Mengontrol loading state

// Fetch units dari unitStore saat komponen di-mount
onMounted(async () => {
  isLoading.value = true
  try {
    await unitStore.fetchUnits() // Memanggil fetchUnits dari unitStore
  } catch (error) {
    console.error('Error fetching units:', error)
  } finally {
    isLoading.value = false
  }
})

// Data units
const units = computed(() => unitStore.units || [])

// Pilih unit
const selectUnit = async unit => {
  const authToken = getAuthToken()

  if (!authToken) {
    console.error('Auth token missing. Redirecting to login.')
    navigateTo('/login')
    
    return
  }

  const query = `
    mutation SelectUnit($unitId: Int!) {
      selectUnit(unitId: $unitId)
    }
  `

  const variables = { unitId: unit.id }

  try {
    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL error:', result.errors)
      throw new Error('Failed to select unit')
    }

    const unitToken = result.data.selectUnit

    if (!unitToken) {
      throw new Error('Unit token not received')
    }

    // Simpan unit token
    setSelectedUnitToken(unitToken)

    // Redirect ke halaman berikutnya
    navigateTo('/dashboard')
  } catch (error) {
    console.error('Error selecting unit:', error)
  }
}
</script>

<template>
  <div>
    <!-- Loading Indicator -->
    <div
      v-if="isLoading"
      class="loading-overlay"
    >
      <div class="spinner" />
    </div>

    <!-- Daftar Unit -->
    <VRow
      v-if="!isLoading"
      class="pt-6 px-8 mx-auto"
      style="max-inline-size: 1200px;"
    >
      <VCol
        v-for="unit in units"
        :key="unit.id"
        cols="12"
        sm="6"
        lg="4"
        class="mb-4"
      >
        <VCard class="pa-8 full-width-card">
          <VCardText class="v-card-text-expanded">
            <h5 class="unit-title">
              {{ unit.name }}
            </h5> <!-- Nama Unit -->
            <div class="d-flex align-center">
              <VBtn
                color="primary"
                @click="selectUnit(unit)"
              >
                Select Unit
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
/* Menjadikan VCard lebar penuh dalam kolom */
.full-width-card {
  inline-size: 100%;
}

/* Memperluas area teks di dalam VCard */
.v-card-text-expanded {
  inline-size: 100%;
  text-align: center;
}

/* Memperbesar teks judul unit */
.unit-title {
  color: #333; /* Warna teks lebih kontras */
  font-size: 1.5rem; /* Ukuran font lebih besar */
  font-weight: bold; /* Membuat teks lebih tebal */
  margin-block-end: 1rem; /* Memberikan jarak bawah */
}
</style>


