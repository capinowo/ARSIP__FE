<script setup>
import { getSelectedRoleToken, setSelectedUnitToken } from '@/middleware/auth'
import { useUnitStore } from '@/stores/unitStore' // Import store untuk unit data
import { BASE_URL } from "@/utils/api"
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
const snackbar = ref({
  show: false,
  message: '',
  color: 'error', // Default warna merah untuk error
})

const showSnackbar = (message, color = 'error') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
  setTimeout(() => {
    snackbar.value.show = false
  }, 3000) // Snackbar akan hilang setelah 3 detik
}

// Pilih unit
const selectUnit = async unit => {
  const roleToken = getSelectedRoleToken()

  if (!roleToken) {
    console.error('Auth token missing. Redirecting to login.')
    showSnackbar('Token otentikasi tidak ditemukan. Silakan login ulang.', 'error')
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

    const response = await fetch(BASE_URL, {
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

    // Tangani error dari GraphQL response
    if (result.errors) {
      console.error('GraphQL error:', result.errors)

      const errorMessage = result.errors[0]?.message || 'Terjadi kesalahan saat memilih unit'

      showSnackbar(errorMessage, 'error')
      
      return
    }

    const unitToken = result.data.selectUnit

    if (!unitToken) {
      throw new Error('Unit token not received')
    }

    // Simpan unit token
    setSelectedUnitToken(unitToken)

    // Tampilkan notifikasi sukses
    showSnackbar('Unit berhasil dipilih!', 'success')

    // Redirect ke halaman berikutnya
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
  } catch (error) {
    console.error('Error selecting unit:', error)
    showSnackbar(error.message || 'Terjadi kesalahan tidak diketahui', 'error')
  }
}
</script>

<template>
  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    top
    :timeout="3000"
    multi-line
  >
    {{ snackbar.message }}
  </VSnackbar>

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




