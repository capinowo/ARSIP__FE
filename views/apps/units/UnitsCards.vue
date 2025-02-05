<script setup>
import { getSelectedRoleToken, setSelectedUnitToken } from '@/middleware/auth'
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

// console.log(unitStore.units)

// Pilih unit
const selectUnit = async unit => {
  const roleToken = getSelectedRoleToken()

  if (!roleToken) {
    console.error('Auth token missing. Redirecting to login.')
    navigateTo('/login')
    
    return
  }

  try {

    const query = `
    mutation SelectUnit($unitId: Int!) {
      selectUnit(unitId: $unitId)
    }
  `

    const variables = { unitId: unit.id }

    const response = await fetch('https://a98c7c1a-d4c9-48dd-8fd1-6a7833d51149.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${roleToken}`,
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
    navigateTo('/')
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
        md="4"
        lg="4"
        xl="3"
        class="mb-2"
      >
        <VCard class="pa-6 full-height-card">
          <VCardText class="v-card-text-expanded">
            <h5 class="unit-title">
              {{ unit.name }}
            </h5>
          </VCardText>
          <div class="button-container">
            <VBtn
              color="primary"
              @click="selectUnit(unit)"
            >
              Select Unit
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
/* Menyamakan tinggi semua kartu */
.full-height-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  block-size: 100%;
}

/* Memperluas area teks agar kartu tetap konsisten */
.v-card-text-expanded {
  flex-grow: 1;
  text-align: center;
}

/* Memperbesar teks judul unit */
.unit-title {
  color: #333; /* Warna teks lebih kontras */
  font-size: 1.5rem; /* Ukuran font lebih besar */
  font-weight: bold; /* Membuat teks lebih tebal */
  margin-block-end: 1rem; /* Memberikan jarak bawah */
  white-space: normal; /* Memungkinkan teks turun ke baris berikutnya */
  word-wrap: break-word; /* Memastikan teks tidak keluar dari area */
}

/* Menempatkan tombol di bagian bawah */
.button-container {
  display: flex;
  justify-content: center;
  margin-block-start: auto;
  padding-block: 1rem;
}
</style>




